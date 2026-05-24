export const uploadToCloudinary = async (
  file: File,
  resourceType: "image" | "video" = "image"
) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "our_space")
  formData.append("folder", "our_space")

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dw9dabcfw/${resourceType}/upload`,
    { method: "POST", body: formData }
  )

  if (!res.ok) throw new Error("Cloudinary upload failed")

  const data = await res.json()
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    resourceType: data.resource_type as string,
  }
}
