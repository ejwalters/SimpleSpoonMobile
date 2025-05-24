import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator, Keyboard } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'

export default function CreateRecipeScreen({ navigation }) {
  const [mode, setMode] = useState('manual') // 'manual' or 'scan'
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: [],
    ingredients: [],
    instructions: [],
    nutrition_info: {},
    image: null,
  })
  const [ingredientInput, setIngredientInput] = useState('')
  const [editingIngredientIdx, setEditingIngredientIdx] = useState<number | null>(null)
  const [stepInput, setStepInput] = useState('')
  const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null)
  const [steps, setSteps] = useState(form.instructions.map((step, idx) => ({ key: `${idx}`, label: step })))

  // --- Image Picker and AI Extraction ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.cancelled) {
      setImage(result.uri)
      setLoading(true)
      try {
        // For React Native, use a polyfill for FormData if needed
        const data = new FormData()
        data.append('file', {
          uri: result.uri,
          name: 'recipe.jpg',
          type: 'image/jpeg',
        } as unknown as Blob)

        const res = await fetch('http://localhost:3001/api/analyze-recipe-image', {
          method: 'POST',
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

  // --- Save Handler ---
  const handleSave = async () => {
    // Add user_id, etc.
    // POST to your backend
    // On success: navigation.goBack()
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
        {/* --- Image Picker --- */}
        <Text style={styles.sectionHeader}>Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image || form.image ? (
            <Image source={{ uri: image || form.image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color="#FF5C8A" />
              <Text style={styles.imagePickerText}>Add a photo</Text>
            </View>
          )}
        </TouchableOpacity>

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
        <Text style={styles.sectionHeader}>Nutrition (optional)</Text>
        {Object.entries(form.nutrition_info).map(([key, value], idx) => (
          <View key={key} style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 6 }]}
              placeholder="Nutrient (e.g. Calories)"
              value={key}
              onChangeText={v => {
                const newInfo = { ...form.nutrition_info }
                newInfo[v] = newInfo[key]
                delete newInfo[key]
                updateField('nutrition_info', newInfo)
              }}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Amount"
              value={value}
              onChangeText={v => {
                const newInfo = { ...form.nutrition_info }
                newInfo[key] = v
                updateField('nutrition_info', newInfo)
              }}
            />
            <TouchableOpacity onPress={() => {
              const newInfo = { ...form.nutrition_info }
              delete newInfo[key]
              updateField('nutrition_info', newInfo)
            }}>
              <Ionicons name="remove-circle" size={24} color="#FF5C8A" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => updateField('nutrition_info', { ...form.nutrition_info, '': '' })}
        >
          <Ionicons name="add-circle" size={22} color="#FF5C8A" />
          <Text style={styles.addBtnText}>Add Nutrition Fact</Text>
        </TouchableOpacity>

        {/* --- Highlight/Description Field --- */}
        <Text style={styles.sectionHeader}>Highlight</Text>
        <TextInput
          style={styles.input}
          placeholder="What makes this recipe special? (e.g. '5-min breakfast, kid-friendly, high-protein...')"
          value={form.description}
          onChangeText={v => updateField('description', v)}
          multiline
        />

        {/* --- Save Button --- */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Recipe</Text>
        </TouchableOpacity>
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
})
