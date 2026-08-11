import os
import json
from flask import Flask, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)

# Load the model weights file ONCE on worker initialization
MODEL_PATH = "best.pt"
print(f"[EcoVision Engine] Loading tensor weights from '{MODEL_PATH}' into memory...")
model = YOLO(MODEL_PATH)
print("[EcoVision Engine] Model resident inside RAM. Persistent inference system ONLINE.")

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file chunk found in multipart payload"}), 400
        
    file = request.files['file']
    temp_path = f"server_tmp_{file.filename}"
    file.save(temp_path)
    
    try:
        # Live instant inference loop directly from memory cache arrays
        results = model.predict(source=temp_path, conf=0.1, verbose=False)
        
        predictions = []
        if len(results) > 0:
            boxes = results[0].boxes
            names = results[0].names
            
            for box in boxes:
                # Extract normalized coordinates (values ranging from 0.0 to 1.0)
                xywhn = box.xywhn[0].tolist() 
                conf = float(box.conf[0].item())
                cls_id = int(box.cls[0].item())
                class_name = names[cls_id]

                # Convert center-based xywh to top-left percentage offsets for CSS placement rules
                w_pct = xywhn[2] * 100
                h_pct = xywhn[3] * 100
                x_pct = (xywhn[0] - (xywhn[2] / 2)) * 100
                y_pct = (xywhn[1] - (xywhn[3] / 2)) * 100

                predictions.append({
                    "className": class_name,
                    "confidence": conf,
                    "x": x_pct,
                    "y": y_pct,
                    "w": w_pct,
                    "h": h_pct
                })
        
        # Housekeeping: Purge file pointer buffers instantly post-compute
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({
            "predictions": predictions, 
            "latency": float(results[0].speed['inference'])
        })
        
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Bind to standard local sandbox port
    app.run(host="127.0.0.1", port=5000, debug=False)