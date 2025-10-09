import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { budgetItems, guestCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate current totals
    const totalEstimated = budgetItems.reduce((sum: number, item: any) => sum + (item.estimated_cost || 0), 0);
    const totalSpent = budgetItems.reduce((sum: number, item: any) => sum + (item.actual_cost || 0), 0);

    // Build context for AI
    const budgetContext = budgetItems.map((item: any) => 
      `${item.category || 'Other'}: ${item.item_name} - Estimated: ₹${item.estimated_cost || 0}, Actual: ₹${item.actual_cost || 0}, Status: ${item.status}`
    ).join('\n');

    const systemPrompt = `You are an expert wedding budget advisor. Analyze the provided budget and suggest optimizations.
Focus on:
1. Identifying overspending areas
2. Suggesting cost-saving alternatives
3. Recommending budget reallocation
4. Highlighting missing essential categories
5. Providing specific, actionable recommendations

Keep suggestions practical and specific to Indian weddings. Format your response in clear sections with bullet points.`;

    const userPrompt = `Please analyze this wedding budget and provide optimization suggestions:

Guest Count: ${guestCount || 'Not specified'}
Total Estimated Budget: ₹${totalEstimated}
Total Spent: ₹${totalSpent}
Remaining: ₹${totalEstimated - totalSpent}

Current Budget Breakdown:
${budgetContext}

Provide specific optimization suggestions, cost-saving tips, and budget recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in budget-optimizer function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
