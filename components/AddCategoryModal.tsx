"use client"

import { useState } from "react"
import { View, Text, Modal, TouchableOpacity } from "react-native"
import { Button } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input"
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control"
import { X } from "lucide-react-native"


interface AddCategoryModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (url: string) => void
}

export default function AddCategoryModal({ visible, onClose, onSubmit }: AddCategoryModalProps) {
  const [pinterestUrl, setPinterestUrl] = useState("")

  const handleSubmit = () => {
    if (pinterestUrl.trim()) {
      onSubmit(pinterestUrl)
      setPinterestUrl("")
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-xl w-4/5 max-w-md">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">Add Category from Pinterest</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <FormControl className="mb-4">
            <FormControlLabel>
              <FormControlLabelText>Pinterest Board URL</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                placeholder="https://pinterest.com/username/board-name"
                value={pinterestUrl}
                onChangeText={setPinterestUrl}
              />
            </Input>
          </FormControl>

          <Text className="text-gray-500 mb-4">
            Enter the URL of a public Pinterest board to create a new style category
          </Text>

          <View className="flex-row justify-end space-x-2">
            <Button variant="outline" onPress={onClose} size="sm" className="mr-2">
              <Text className="text-gray-700">Cancel</Text>
            </Button>

            <Button onPress={handleSubmit} size="sm" isDisabled={!pinterestUrl.trim()}>
              <Text className="text-white">Add Category</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}

