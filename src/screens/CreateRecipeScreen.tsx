import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator, Keyboard } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import { API_BASE_URL } from '../constants/config'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../services/supabaseClient'
import { decode } from 'base64-arraybuffer';

export default function CreateRecipeScreen({ navigation, route }) {
  const isEdit = route?.params?.isEdit;
  const editingRecipe = route?.params?.recipe;
  const [mode, setMode] = useState('manual')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const user = supabase.auth.user()
    if (user) setUserId(user.id)
  }, [])
  // Helper to upload a single image and return its public URL
  const uploadImageToStorage = async (uri, userId, idx) => {
    try {
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Convert to ArrayBuffer for Supabase
      const arrayBuffer = decode(base64);
  
      // Generate a unique filename
      const filename = `${userId}/recipe_${Date.now()}_${idx}.jpg`;
  
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(filename, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
  
      if (error) throw error;
  
      // Get the public URL
      const { publicURL } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filename).data;
  
      return publicURL;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };
  

  const [form, setForm] = useState(
    editingRecipe
      ? {
          ...editingRecipe,
          nutrition_info: Object.fromEntries(
            Object.entries(editingRecipe.nutrition_info || {}).map(([k, v]) => [k, v != null ? String(v) : ''])
          ),
          tag: Array.isArray(editingRecipe.tag) ? [...editingRecipe.tag] : [],
          ingredients: Array.isArray(editingRecipe.ingredients) ? [...editingRecipe.ingredients] : [],
          instructions: Array.isArray(editingRecipe.instructions) ? [...editingRecipe.instructions] : [],
          image: editingRecipe.image || null,
        }
      : {
          title: '',
          highlight: '',
          tag: [],
          ingredients: [],
          instructions: [],
          nutrition_info: {
            calories: '',
            fat: '',
            cholesterol: '',
            sodium: '',
            carbs: '',
            fiber: '',
            sugar: '',
            protein: '',
          },
          image: null,
        }
  )
  const [ingredientInput, setIngredientInput] = useState('')
  const [editingIngredientIdx, setEditingIngredientIdx] = useState<number | null>(null)
  const [stepInput, setStepInput] = useState('')
  const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null)
  const [steps, setSteps] = useState<{ key: string, label: string }[]>(form.instructions.map((step, idx) => ({ key: `${idx}`, label: step })))
  const [images, setImages] = useState<string[]>([])

  // Add state for allImages
  const [allImages, setAllImages] = useState(() => {
    if (isEdit && editingRecipe) {
      const existing = [editingRecipe.image, ...(editingRecipe.supporting_images || [])].filter(Boolean)
      return [...existing]
    }
    return []
  })

  // When new images are picked, add to allImages
  const handleAddImages = (uris) => setAllImages(prev => [...prev, ...uris])

  // Remove image by index
  const handleRemoveImage = (idx) => setAllImages(prev => prev.filter((_, i) => i !== idx))

  // --- Image Picker for Start from Scratch (multi-image) ---
  const pickImageFromLibrary = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages(prev => [...prev, ...result.assets.map(asset => asset.uri)])
    }
  }
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
    }
  }

  // --- Image Picker and AI Extraction for Scan a Recipe Card ---
  const pickImageForAI = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLoading(true)
      try {
        const uri = result.assets[0].uri
        const data = new FormData()
        data.append('file', {
          uri,
          name: 'recipe.jpg',
          type: 'image/jpeg',
        } as unknown as Blob)
        const res = await fetch(`${API_BASE_URL}/api/analyze-recipe-image`, {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const extracted = await res.json()
        setForm({ ...form, ...extracted })
      } catch (err) {
        alert('Failed to analyze image. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  // --- Form Handlers ---
  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const updateArrayField = (field, idx, value) => {
    setForm(f => {
      const arr = [...f[field]]
      arr[idx] = value
      return { ...f, [field]: arr }
    })
  }
  const addArrayField = (field) => setForm(f => ({ ...f, [field]: [...f[field], ''] }))
  const removeArrayField = (field, idx) => setForm(f => {
    const arr = [...f[field]]
    arr.splice(idx, 1)
    return { ...f, [field]: arr }
  })

  // Save handler: upload all images, then send recipe to backend
  const handleSave = async () => {
    if (!userId) {
      alert('User not authenticated')
      return
    }
    if (!form.title.trim()) {
      alert('Please enter a recipe title')
      return
    }
    setLoading(true)
    try {
      let mainImageUrl = null
      let supportingImageUrls = []
      if (allImages.length > 0) {
        // Upload any local images (not URLs)
        const uploadPromises = allImages.map(async (uri, idx) => {
          if (uri.startsWith('http')) return uri
          return await uploadImageToStorage(uri, userId, idx)
        })
        const urls = await Promise.all(uploadPromises)
        mainImageUrl = urls[0]
        supportingImageUrls = urls.slice(1)
      }
      // Ensure nutrition_info is a flat object
      let nutritionInfo = form.nutrition_info;
      if (Array.isArray(nutritionInfo)) nutritionInfo = nutritionInfo[0];
      const recipePayload = {
        ...form,
        nutrition_info: nutritionInfo,
        user_id: userId,
        image: mainImageUrl,
        supporting_images: supportingImageUrls,
      }
      if (isEdit) {
        // PATCH to /update-recipe with id and updated fields
        const { id, ...fieldsToUpdate } = recipePayload
        const res = await fetch(`${API_BASE_URL}/update-recipe`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingRecipe.id, ...fieldsToUpdate })
        })
        const result = await res.json()
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update recipe')
        alert('Recipe updated!')
        navigation.reset({
          index: 1,
          routes: [
            { name: 'MainTabs' },
            { name: 'RecipeDetail', params: { recipe: { ...fieldsToUpdate, id: editingRecipe.id } } }
          ]
        })
      } else {
        // POST to /save-recipe as before
        const res = await fetch(`${API_BASE_URL}/save-recipe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe: recipePayload })
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to save recipe')
        alert('Recipe saved!')
        navigation.goBack()
      }
    } catch (err) {
      alert('Save failed: ' + (err.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  // Render function for each step
  const renderStepItem = ({ item, drag, isActive, getIndex }: RenderItemParams<{ key: string, label: string }>) => {
    const index = getIndex?.() ?? 0;
    return (
      <View style={styles.stepRow}>
        <View style={styles.stepNumberCircle}>
          <Text style={styles.stepNumberText}>{index + 1}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.chip,
            isActive && { backgroundColor: '#FFB6C1' }
          ]}
          onLongPress={drag}
          delayLongPress={150}
          activeOpacity={0.9}
          onPress={() => {
            setStepInput(item.label);
            setEditingStepIdx(index);
          }}
        >
          <Text style={styles.chipText}>{item.label}</Text>
          <TouchableOpacity
            onPress={() => {
              const newSteps = steps.filter((_, i) => i !== index)
              setSteps(newSteps)
              setForm(f => ({ ...f, instructions: newSteps.map(s => s.label) }))
            }}
            style={styles.chipDelete}
          >
            <Ionicons name="close" size={16} color="#FF5C8A" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const handleStepAddOrEdit = () => {
    if (stepInput.trim()) {
      let newSteps;
      if (editingStepIdx !== null) {
        // Edit existing step
        newSteps = steps.map((s, idx) =>
          idx === editingStepIdx ? { ...s, label: stepInput.trim() } : s
        );
      } else {
        // Add new step
        newSteps = [
          ...steps,
          { key: `${Date.now()}`, label: stepInput.trim() }
        ];
      }
      setSteps(newSteps);
      setForm(f => ({ ...f, instructions: newSteps.map(s => s.label) }));
      setStepInput('');
      setEditingStepIdx(null);
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isEdit && (
        <View style={styles.editHeaderNoBg}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Ionicons name="arrow-back" size={24} color="#FF5C8A" />
          </TouchableOpacity>
          <Text style={styles.editHeaderText}>Edit Recipe</Text>
        </View>
      )}
      {!isEdit && (
        <View style={styles.modeSwitch}>
          <TouchableOpacity style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]} onPress={() => setMode('manual')}>
            <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>Start from scratch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, mode === 'scan' && styles.modeBtnActive]} onPress={() => setMode('scan')}>
            <Text style={[styles.modeText, mode === 'scan' && styles.modeTextActive]}>Scan a recipe card</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.formCard} keyboardShouldPersistTaps="handled">
        {(mode === 'manual' || isEdit) ? (
          <>
            <Text style={styles.sectionHeader}>Images</Text>
            <DraggableFlatList
              data={allImages}
              horizontal
              keyExtractor={(item, idx) => item + idx}
              onDragEnd={({ data }) => setAllImages(data)}
              activationDistance={8}
              dragItemOverflow={true}
              renderItem={({ item, drag, isActive, getIndex }) => {
                const index = getIndex?.() ?? 0;
                return (
                  <View style={styles.imageThumbContainer}>
                    <TouchableOpacity onLongPress={drag} activeOpacity={0.9}>
                      <Image source={{ uri: item }} style={styles.imageThumb} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => handleRemoveImage(index)}>
                      <Ionicons name="close-circle" size={22} color="#FF5C8A" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>
                    )}
                  </View>
                );
              }}
              contentContainerStyle={styles.imageScroll}
            />
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity style={styles.addImageBtn} onPress={async () => {
                let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 })
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  handleAddImages(result.assets.map(asset => asset.uri))
                }
              }}>
                <Ionicons name="images" size={28} color="#FF5C8A" />
                <Text style={styles.addImageText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addImageBtn} onPress={async () => {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') { alert('Camera permission is required!'); return; }
                let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 })
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  handleAddImages(result.assets.map(asset => asset.uri))
                }
              }}>
                <Ionicons name="camera" size={28} color="#FF5C8A" />
                <Text style={styles.addImageText}>Camera</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionHeader}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipe Title"
              value={form.title}
              onChangeText={v => updateField('title', v)}
              returnKeyType="next"
            />
            <Text style={styles.sectionHeader}>Ingredients</Text>
            <View style={styles.chipRow}>
              {form.ingredients.map((ing, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chip}
                  onPress={() => {
                    setIngredientInput(ing)
                    setEditingIngredientIdx(idx)
                  }}
                >
                  <Text style={styles.chipText}>{ing}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      removeArrayField('ingredients', idx)
                      if (editingIngredientIdx === idx) {
                        setEditingIngredientIdx(null)
                        setIngredientInput('')
                      }
                    }}
                    style={styles.chipDelete}
                  >
                    <Ionicons name="close" size={16} color="#FF5C8A" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.chipInputColumn}>
              <TextInput
                style={styles.chipInput}
                placeholder="Add ingredient"
                value={ingredientInput}
                onChangeText={setIngredientInput}
                onSubmitEditing={() => {
                  if (ingredientInput.trim()) {
                    if (editingIngredientIdx !== null) {
                      updateArrayField('ingredients', editingIngredientIdx, ingredientInput.trim())
                      setEditingIngredientIdx(null)
                    } else {
                      addArrayField('ingredients')
                      updateArrayField('ingredients', form.ingredients.length, ingredientInput.trim())
                    }
                    setIngredientInput('')
                    Keyboard.dismiss()
                  }
                }}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addActionBtn,
                  !ingredientInput.trim() && styles.addActionBtnDisabled
                ]}
                onPress={() => {
                  if (ingredientInput.trim()) {
                    if (editingIngredientIdx !== null) {
                      updateArrayField('ingredients', editingIngredientIdx, ingredientInput.trim())
                      setEditingIngredientIdx(null)
                    } else {
                      addArrayField('ingredients')
                      updateArrayField('ingredients', form.ingredients.length, ingredientInput.trim())
                    }
                    setIngredientInput('')
                    Keyboard.dismiss()
                  }
                }}
                disabled={!ingredientInput.trim()}
                activeOpacity={ingredientInput.trim() ? 0.8 : 1}
              >
                <Ionicons
                  name={editingIngredientIdx !== null ? 'pencil' : 'add-circle'}
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.addActionBtnText}>
                  {editingIngredientIdx !== null ? 'Save Change' : 'Add Ingredient'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionHeader}>Steps</Text>
            <DraggableFlatList
              data={steps}
              onDragEnd={({ data }) => {
                setSteps(data)
                setForm(f => ({ ...f, instructions: data.map(s => s.label) }))
              }}
              keyExtractor={item => item.key}
              activationDistance={8}
              renderItem={({ item, drag, isActive, getIndex }: { item: { key: string, label: string }, drag: any, isActive: boolean, getIndex?: () => number }) => {
                const index = getIndex?.() ?? 0;
                return (
                  <View style={styles.stepCard}>
                    <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
                      <Ionicons name="reorder-three" size={22} color="#FF5C8A" />
                    </TouchableOpacity>
                    <View style={styles.stepNumberCircle}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepCardText}>{item.label}</Text>
                    <TouchableOpacity style={styles.chipDelete} onPress={() => {
                      const newSteps = steps.filter((_, i) => i !== index)
                      setSteps(newSteps)
                      setForm(f => ({ ...f, instructions: newSteps.map(s => s.label) }))
                    }}>
                      <Ionicons name="close" size={16} color="#FF5C8A" />
                    </TouchableOpacity>
                  </View>
                );
              }}
              scrollEnabled={false}
              containerStyle={{ marginBottom: 8 }}
            />
            <View style={styles.chipInputColumn}>
              <TextInput
                style={styles.chipInput}
                placeholder="Add step"
                value={stepInput}
                onChangeText={setStepInput}
                onSubmitEditing={handleStepAddOrEdit}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addActionBtn,
                  !stepInput.trim() && styles.addActionBtnDisabled
                ]}
                onPress={handleStepAddOrEdit}
                disabled={!stepInput.trim()}
                activeOpacity={stepInput.trim() ? 0.8 : 1}
              >
                <Ionicons
                  name={editingStepIdx !== null ? 'pencil' : 'add-circle'}
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.addActionBtnText}>
                  {editingStepIdx !== null ? 'Save Change' : 'Add Step'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.nutritionCard}>
              <Text style={styles.sectionHeader}>Nutrition (optional)</Text>
              {[
                { key: 'calories', label: 'Calories', unit: 'kcal' },
                { key: 'fat', label: 'Fat', unit: 'g' },
                { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
                { key: 'sodium', label: 'Sodium', unit: 'mg' },
                { key: 'carbs', label: 'Carbs', unit: 'g' },
                { key: 'fiber', label: 'Fiber', unit: 'g' },
                { key: 'sugar', label: 'Sugar', unit: 'g' },
                { key: 'protein', label: 'Protein', unit: 'g' },
              ].map(({ key, label, unit }) => (
                <View key={key} style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>{label}</Text>
                  <View style={styles.nutritionInputRow}>
                    <TextInput
                      style={styles.nutritionInput}
                      placeholder={unit}
                      value={form.nutrition_info[key]}
                      onChangeText={v => {
                        const newInfo = { ...form.nutrition_info }
                        newInfo[key] = v
                        updateField('nutrition_info', newInfo)
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.sectionHeader}>Highlight</Text>
            <TextInput
              style={styles.input}
              placeholder="What makes this recipe special? (e.g. '5-min breakfast, kid-friendly, high-protein...')"
              value={form.highlight}
              onChangeText={v => updateField('highlight', v)}
              multiline
            />
            <TouchableOpacity 
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.saveBtnContent}>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={[styles.saveBtnText, { marginLeft: 8 }]}>
                    {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress * 100)}%` : 'Saving...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.saveBtnText}>{isEdit ? 'Update Recipe' : 'Save Recipe'}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionHeader}>Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImageForAI}>
              {image || form.image ? (
                <Image source={{ uri: image || form.image }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color="#FF5C8A" />
                  <Text style={styles.imagePickerText}>Add a photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {loading && <ActivityIndicator size="large" color="#FF5C8A" style={{ marginVertical: 12 }} />}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF5F7' },
  modeSwitch: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16, gap: 12 },
  modeBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#F2F2F2' },
  modeBtnActive: { backgroundColor: '#FF5C8A' },
  modeText: { color: '#555', fontWeight: '600' },
  modeTextActive: { color: '#FFF' },
  formCard: { backgroundColor: '#fff', borderRadius: 18, margin: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  imagePicker: { alignItems: 'center', marginBottom: 10 },
  imagePickerText: { color: '#FF5C8A', marginTop: 6, fontWeight: '600' },
  imagePreview: { width: 120, height: 120, borderRadius: 12, marginBottom: 8 },
  saveBtn: { backgroundColor: '#FF5C8A', borderRadius: 20, padding: 16, alignItems: 'center', marginTop: 18 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5C8A',
    marginTop: 18,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: -2,
  },
  addBtnText: {
    color: '#FF5C8A',
    fontWeight: '600',
    marginLeft: 4,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#FFF5F7',
    borderWidth: 1,
    borderColor: '#FF5C8A44',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5C8A22',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    color: '#FF5C8A',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  chipDelete: {
    marginLeft: 2,
  },
  chipInputColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 16,
    gap: 8,
  },
  chipInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  addActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5C8A',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 4,
    shadowColor: '#FF5C8A',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    opacity: 1,
  },
  addActionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  addActionBtnDisabled: {
    backgroundColor: '#FFD6E8',
    opacity: 0.7,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#FF5C8A',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  nutritionRow: {
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5C8A',
    marginBottom: 4,
  },
  nutritionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  nutritionRemoveBtn: {
    marginLeft: 8,
  },
  nutritionAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nutritionAddText: {
    color: '#FF5C8A',
    fontWeight: '600',
    marginLeft: 4,
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 4,
  },
  imageThumbContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FFF5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5C8A44',
    marginRight: 8,
  },
  addImageText: {
    color: '#FF5C8A',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 2,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  editHeaderNoBg: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  editHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF5C8A',
    marginLeft: 8,
  },
  cancelBtn: {
    padding: 6,
    borderRadius: 20,
  },
  defaultBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#FF5C8A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 3,
  },
  defaultBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB6C133',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal: 0,
    alignSelf: 'stretch',
    overflow: 'hidden',
    marginBottom: 12,
  },
  dragHandle: {
    marginRight: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCardText: {
    flex: 1,
    color: '#333',
    fontSize: 15,
    marginLeft: 10,
  },
})