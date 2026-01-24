import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, image, audio, audioMimeType, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing vehicle diagnosis request:", {
      hasMessage: !!message,
      hasImage: !!image,
      hasAudio: !!audio,
      historyLength: conversationHistory?.length || 0,
    });

    // Build the system prompt for vehicle fault detection
    const systemPrompt = `You are AutoDiagAI, an expert vehicle fault detection and diagnosis system. You specialize in:

1. **Visual Fault Analysis**: Analyzing images of engine components, parts, and systems to identify:
   - Corrosion, rust, and oxidation
   - Fluid leaks (oil, coolant, fuel, brake fluid)
   - Wear patterns and damage
   - Broken, cracked, or missing components
   - Electrical issues (burned wires, corroded connections)
   - Belt and hose deterioration

2. **Audio Fault Analysis**: Interpreting engine sounds to identify:
   - Knocking or pinging (potential rod bearing, detonation issues)
   - Rattling (loose components, timing chain)
   - Squealing (belts, pulleys, brakes)
   - Grinding (transmission, differential, brakes)
   - Misfiring patterns
   - Unusual exhaust sounds

3. **Symptom Analysis**: Evaluating described symptoms to diagnose:
   - Starting problems
   - Performance issues
   - Warning lights and their meanings
   - Vibrations and handling problems
   - Electrical malfunctions

When providing diagnosis:
- Start with a severity assessment (🟢 Minor | 🟡 Moderate | 🔴 Critical)
- Explain the likely cause in clear terms
- Suggest immediate actions if critical
- Recommend professional inspection when appropriate
- Provide estimated repair complexity (DIY-friendly vs Professional only)

Be thorough but concise. Use technical terms but explain them for non-mechanics.`;

    // Build the messages array
    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (without images/audio for context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6); // Keep last 6 messages
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Build the current user message with multimodal content
    const userContent: any[] = [];

    // Add the text message
    userContent.push({
      type: "text",
      text: message || "Please analyze the provided media for vehicle faults.",
    });

    // Add image if provided
    if (image) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${image}`,
        },
      });
    }

    // Add audio if provided
    if (audio && audioMimeType) {
      userContent.push({
        type: "input_audio",
        input_audio: {
          data: audio,
          format: audioMimeType.includes("webm") ? "webm" : "wav",
        },
      });
    }

    messages.push({
      role: "user",
      content: userContent,
    });

    console.log("Sending request to Gemini API...");

    // Call the Lovable AI Gateway (Gemini)
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const diagnosis = data.choices?.[0]?.message?.content || "Unable to generate diagnosis.";

    console.log("Diagnosis generated successfully");

    return new Response(
      JSON.stringify({ diagnosis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Vehicle diagnosis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
