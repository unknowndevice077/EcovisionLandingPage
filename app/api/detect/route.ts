import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData(); // Get the form data from the request[cite: 8]
    const file = formData.get("file") as File; // Extract the uploaded file[cite: 8]

    if (!file) {
      return NextResponse.json({ error: "No image file found in the request" }, { status: 400 }); // Simplified error[cite: 8]
    }

    const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://127.0.0.1:5000"; // Get python server URL[cite: 8]

    // Send the uploaded image directly to your background Python script[cite: 8]
    const pythonResponse = await fetch(`${pythonBackendUrl}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!pythonResponse.ok) {
      const errData = await pythonResponse.json(); // Read backend error[cite: 8]
      return NextResponse.json(
        { error: errData.error || "The Python AI server ran into an error" }, // Simplified error[cite: 8]
        { status: pythonResponse.status }
      );
    }

    const data = await pythonResponse.json(); // Get successful prediction data[cite: 8]
    return NextResponse.json(data); // Send data back to the user[cite: 8]

  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not connect to the background AI server: ${err.message}` }, // Simplified error[cite: 8]
      { status: 500 }
    );
  }
}