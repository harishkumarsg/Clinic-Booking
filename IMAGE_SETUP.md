# Image Setup Instructions

## 📸 Adding Clinic Logo and Doctor Photo

You need to add two images to the `public` folder:

### 1. Clinic Logo
- **File name:** `clinic-logo.png`
- **Location:** `public/clinic-logo.png`
- **Source:** The "DR. SINDHU'S SKIN CLINIC" logo with teal branding
- **Recommended size:** 800x200px (or maintain aspect ratio)

### 2. Doctor Photo
- **File name:** `doctor-sindhu.jpg`
- **Location:** `public/doctor-sindhu.jpg`
- **Source:** Photo of Dr. Sindhu in white coat
- **Recommended size:** 600x600px (square format for consistent display)

## ⚡ Quick Setup Steps

### Option 1: Manual Copy (Easiest)
1. Save the clinic logo image as `clinic-logo.png`
2. Save the doctor photo as `doctor-sindhu.jpg`
3. Copy both files to the `public` folder in your project
4. Done! The app will automatically use these images

### Option 2: Using PowerShell Script
Run the provided script to set up placeholder files:
```powershell
.\setup-images.ps1
```

## ✅ Verification

After adding the images:
1. Start the development server: `pnpm dev`
2. Open http://localhost:3000
3. You should see:
   - Clinic logo in the header (top left)
   - Doctor photo in the hero screen (center)
   - Doctor photo in the sidebar (appointment summary)

## 🎨 Image Optimization Tips

- **Logo:** PNG format with transparent background works best
- **Doctor Photo:** JPG format, optimized for web (< 500KB)
- Next.js will automatically optimize images for performance

## 📍 Where Images Appear

### Clinic Logo:
- Header (all pages)
- Size: ~200-250px wide

### Doctor Photo:
- Hero/Welcome screen (96px circle)
- Appointment sidebar (40px circle)
- Confirmation screen

---

**Note:** The code is already configured to use these images. You just need to place them in the `public` folder with the correct names.
