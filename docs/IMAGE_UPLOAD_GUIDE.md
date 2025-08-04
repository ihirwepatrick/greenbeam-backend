# Image Upload Guide - Supabase Integration

## Overview

The Greenbeam API now supports image uploads to Supabase storage bucket for product images. This replaces the previous URL-based image storage with a more robust file upload system.

## Setup Requirements

### 1. Supabase Configuration

Add these environment variables to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Bucket Setup

1. Create a bucket named `greenbeam` in your Supabase project
2. Set the bucket to public for image access
3. Configure CORS policies if needed

## API Endpoints

### Create Product with Images

**Endpoint:** `POST /api/v1/products`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `name` (required): Product name
- `category` (required): Product category
- `description` (optional): Product description
- `features` (optional): JSON array of features
- `specifications` (optional): JSON object of specifications
- `status` (optional): AVAILABLE or NOT_AVAILABLE
- `image` (optional): Main product image file
- `images` (optional): Additional product images (up to 9 files)

**Example Request (Postman):**
```
POST http://localhost:3000/api/v1/products
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN

Body (form-data):
  name: Premium Solar Panel
  category: Solar Panels
  description: High-efficiency solar panel for residential use
  features: ["High Efficiency", "Weather Resistant", "25 Year Warranty"]
  specifications: {"power": "400W", "efficiency": "21.5%"}
  status: AVAILABLE
  image: [file upload]
  images: [file upload 1]
  images: [file upload 2]
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Premium Solar Panel",
    "category": "Solar Panels",
    "description": "High-efficiency solar panel for residential use",
    "image": "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324000_abc123.jpg",
    "features": ["High Efficiency", "Weather Resistant", "25 Year Warranty"],
    "specifications": {
      "power": "400W",
      "efficiency": "21.5%"
    },
    "rating": 0,
    "reviews": 0,
    "status": "AVAILABLE",
    "images": [
      "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324001_def456.jpg",
      "https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/1705324002_ghi789.jpg"
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Product with Images

**Endpoint:** `PUT /api/v1/products/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:** Same as create, but all fields are optional

**Example Request:**
```
PUT http://localhost:3000/api/v1/products/1
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN

Body (form-data):
  name: Updated Solar Panel
  image: [new main image file]
  images: [additional image file]
```

## File Validation

### Supported File Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limits
- Maximum file size: 5MB per image
- Maximum files per request: 10 images

### File Naming
Files are automatically renamed with timestamp and random string:
```
products/1705324000_abc123def456.jpg
```

## Error Handling

### File Too Large
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size too large. Maximum size is 5MB.",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "statusCode": 400
}
```

### Invalid File Type
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "statusCode": 400
}
```

### Too Many Files
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_FILES",
    "message": "Too many files. Maximum 10 files allowed.",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "statusCode": 400
}
```

## Image Management

### Automatic Cleanup
- When a product is deleted, all associated images are automatically removed from Supabase
- When updating a product, old images are replaced with new ones
- If database operation fails, uploaded images are automatically cleaned up

### Image URLs
- Images are stored in the `greenbeam` bucket under the `products/` folder
- Public URLs are generated automatically
- URLs follow the pattern: `https://your-project.supabase.co/storage/v1/object/public/greenbeam/products/filename.jpg`

## Testing with Postman

### 1. Setup Form Data
1. Select "Body" tab
2. Choose "form-data"
3. Add text fields for product data
4. Add file fields for images

### 2. File Fields Configuration
- **Main Image:** Key = `image`, Type = File
- **Additional Images:** Key = `images`, Type = File (can add multiple)

### 3. Example Test Data
```
Text Fields:
- name: Test Solar Panel
- category: Solar Panels
- description: Test description
- features: ["Feature 1", "Feature 2"]
- specifications: {"test": "value"}
- status: AVAILABLE

File Fields:
- image: [select main image file]
- images: [select additional image 1]
- images: [select additional image 2]
```

## Security Considerations

1. **File Type Validation:** Only image files are allowed
2. **File Size Limits:** Prevents abuse and storage issues
3. **Authentication Required:** Only admins can upload images
4. **Automatic Cleanup:** Prevents orphaned files
5. **Unique Filenames:** Prevents file conflicts

## Troubleshooting

### Common Issues

1. **Missing Supabase Configuration**
   - Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`
   - Verify Supabase project is active

2. **Bucket Not Found**
   - Create bucket named `greenbeam` in Supabase dashboard
   - Set bucket to public

3. **Permission Denied**
   - Check Supabase API key permissions
   - Verify bucket policies

4. **File Upload Fails**
   - Check file size (max 5MB)
   - Verify file type (JPEG, PNG, WebP only)
   - Ensure proper form-data format

### Debug Steps

1. Check server logs for detailed error messages
2. Verify Supabase connection in browser console
3. Test with smaller files first
4. Ensure all required fields are provided

## Migration from URL-based Images

If you have existing products with URL-based images:

1. **No Database Changes Required:** The schema remains the same
2. **Backward Compatibility:** Existing image URLs will continue to work
3. **Gradual Migration:** Update products one by one with new image uploads
4. **Data Preservation:** All existing product data is preserved

## Performance Considerations

1. **Image Optimization:** Consider implementing image compression
2. **CDN Usage:** Supabase provides CDN for faster image delivery
3. **Caching:** Images are cached by Supabase for better performance
4. **Batch Operations:** Multiple images are uploaded in parallel 