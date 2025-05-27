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

export default function CreateRecipeScreen({ navigation }) {
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
  

  const [form, setForm] = useState({
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
  })
  const [ingredientInput, setIngredientInput] = useState('')
  const [editingIngredientIdx, setEditingIngredientIdx] = useState<number | null>(null)
  const [stepInput, setStepInput] = useState('')
  const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null)
  const [steps, setSteps] = useState(form.instructions.map((step, idx) => ({ key: `${idx}`, label: step })))
  const [images, setImages] = useState<string[]>([])

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
      // Upload all images in parallel
      let mainImageUrl = null
      let supportingImageUrls = []
      if (images.length > 0) {
        const uploadPromises = images.map((uri, idx) => uploadImageToStorage(uri, userId, idx))
        const urls = await Promise.all(uploadPromises)
        mainImageUrl = urls[0]
        supportingImageUrls = urls.slice(1)
      }
      // Prepare recipe payload
      const recipePayload = {
        ...form,
        user_id: userId,
        image: mainImageUrl,
        supporting_images: supportingImageUrls,
      }
      // Send to backend
      const res = await fetch(`${API_BASE_URL}/save-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: recipePayload })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to save recipe')
      alert('Recipe saved!')
      navigation.goBack()
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
      {/* Option Selector */}
      <View style={styles.modeSwitch}>
        <TouchableOpacity style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]} onPress={() => setMode('manual')}>
          <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>Start from scratch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'scan' && styles.modeBtnActive]} onPress={() => setMode('scan')}>
          <Text style={[styles.modeText, mode === 'scan' && styles.modeTextActive]}>Scan a recipe card</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.formCard} keyboardShouldPersistTaps="handled">
        {/* Wrap all form sections in a fragment to fix adjacent JSX error */}
        <>
        {/* --- Image Picker --- */}
        {mode === 'manual' ? (
          <>
            <Text style={styles.sectionHeader}>Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imageThumbContainer}>
                  <Image source={{ uri }} style={styles.imageThumb} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImages(images.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="close-circle" size={22} color="#FF5C8A" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImageFromLibrary}>
                <Ionicons name="images" size={28} color="#FF5C8A" />
                <Text style={styles.addImageText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addImageBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={28} color="#FF5C8A" />
                <Text style={styles.addImageText}>Camera</Text>
              </TouchableOpacity>
            </ScrollView>
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

        {/* --- Title --- */}
        <Text style={styles.sectionHeader}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Recipe Title"
          value={form.title}
          onChangeText={v => updateField('title', v)}
          returnKeyType="next"
        />

        {/* --- Ingredients --- */}
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

        {/* --- Steps --- */}
        <Text style={styles.sectionHeader}>Steps</Text>
        <DraggableFlatList
          data={steps}
          onDragEnd={({ data }) => {
            setSteps(data)
            setForm(f => ({ ...f, instructions: data.map(s => s.label) }))
          }}
          keyExtractor={item => item.key}
          renderItem={renderStepItem}
          horizontal={false}
          scrollEnabled={false}
          style={{ marginBottom: 8 }}
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

        {/* --- Nutrition Info --- */}
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

        {/* --- Highlight/Description Field --- */}
        <Text style={styles.sectionHeader}>Highlight</Text>
        <TextInput
          style={styles.input}
          placeholder="What makes this recipe special? (e.g. '5-min breakfast, kid-friendly, high-protein...')"
          value={form.highlight}
          onChangeText={v => updateField('highlight', v)}
          multiline
        />

        {/* --- Save Button --- */}
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
            <Text style={styles.saveBtnText}>Save Recipe</Text>
          )}
        </TouchableOpacity>
        </>
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
})