from ultralytics import YOLO  
import cv2  

# Load the YOLOv8 model  
model = YOLO("yolov8n.pt")  # Use a pretrained model  

# Load and analyze an image  
image_path = "fridge.jpeg"  
results = model(image_path)  

# Display detected objects  
for r in results:
    r.show()