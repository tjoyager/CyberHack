# STRATEGIC SPECIFICATION: SIMA AROME ERP LITE ENHANCEMENTS

**Date:** May 28, 2026  
**Role:** Expert Product Manager & Solutions Architect  
**Project:** Sima Arome ERP Lite (CyberHack 2026)

---

## SECTION 1: AI 'FORM-FILL' INTEGRATION SPEC (AWS Bedrock)

To secure the **Enterprise AI Integration** bonus points, we will implement a "Zero-Entry" intake system. This feature uses **AWS Bedrock (Claude 3.5 Sonnet)** via the BuildPad orchestration layer to transform unstructured physical documents into structured ERP data.

### 1.1 Logical Workflow
1.  **Capture:** `INTAKE_STAFF` receives a physical Delivery Order (DO). They use the mobile-responsive frontend to upload a photo/PDF of the DO.
2.  **Orchestration:** The Frontend calls the FastAPI backend. The backend forwards the image/base64 data to **AWS Bedrock**.
3.  **Extraction:** Bedrock uses an "Instruction-Based Extraction" prompt to identify:
    *   `material_name`: Matches against our `materials` master data using fuzzy search.
    *   `supplier_name`: Matches against our `suppliers` table.
    *   `quantity`: Numerical extraction with UOM (Unit of Measure) detection.
4.  **Verification:** The API returns a JSON payload to the Frontend. The UI "shimmers" and auto-fills the form. The user performs a 1-second visual check and clicks "Confirm."

### 1.2 JSON API Contract Update
**Endpoint:** `POST /api/v1/lots/ai-extract`  
**Description:** Processes invoice images to extract lot details before final submission.

**Request (Multipart/Form-Data):**
```json
{
  "file": "binary_image_data"
}
```

**Success Response (200 OK):**
```json
{
  "confidence_score": 0.98,
  "extracted_data": {
    "material_suggestion": {
      "id": 1,
      "name": "Vanillin Crystal (99% Pure)",
      "match_accuracy": "95%"
    },
    "supplier_suggestion": {
      "id": 3,
      "name": "Nature Extracts S.A."
    },
    "quantity": 500.0,
    "uom": "KG",
    "batch_number_raw": "B-9920-X"
  },
  "ai_metadata": {
    "model": "anthropic.claude-3-5-sonnet-v1",
    "processing_time_ms": 1250
  }
}
```

---

## SECTION 2: 3-MINUTE VIDEO DEMO STORYBOARD

This storyboard is designed to trigger "Yes" votes from judges by addressing the **Problem**, showing **Technological Sophistication**, and proving **Reliability**.

| Time | Scene | Visual | Narrative / Voiceover |
| :--- | :--- | :--- | :--- |
| **00-30s** | **The Hook** | Split screen: Left side shows a pile of messy invoices; Right side shows a stressed employee typing into a spreadsheet. | "Meet Sima Arome, a flavor leader facing a silent crisis: The Double-Entry bottleneck. Data is typed once on paper, once in Excel, and errors are everywhere. This ends today." |
| **30-75s** | **The AI Wow Factor** | Close-up of the mobile UI. A hand clicks 'Scan Invoice'. An image is uploaded. The form fields auto-fill with a glowing highlight. | "Introducing Sima Arome ERP Lite. Our Intake Staff no longer types data. Powered by AWS Bedrock, our system extracts SKU and Quantity in sub-seconds. High accuracy, zero fatigue." |
| **75-135s** | **The State Machine** | Transition to the QC Inspector's Dashboard (Laptop view). See the 'Pending QC' status. One click -> 'Approved'. Then switch to PPIC Manager view. | "Integrity is built-in. Data flows from Intake to QC to PPIC without a single re-keystroke. Our State Machine ensures that only Approved lots can be routed to the production floor." |
| **135-165s** | **The Enterprise Flex** | Screen transition to a dark-mode terminal view showing the `audit_logs` table being updated in real-time. | "For the enterprise, transparency is non-negotiable. Every status change is cryptographically linked to a user and recorded in our immutable PostgreSQL Audit Trail. We aren't just building a tool; we're building a standard." |
| **165-180s** | **Outro / CTA** | The 4-student team standing together (or logos) with the text: 'SIMA AROME ERP LITE - Scalable. Secure. AI-Driven.' | "Sima Arome ERP Lite: Digitizing the scent of success. Built on FastAPI, Next.js, and AWS Bedrock. We are ready for the future of industry. Thank you." |

---

### PRO-TIPS FOR THE TEAM:
*   **For the Backend Engineer:** When implementing the `ai-extract` endpoint, ensure you wrap the AWS Bedrock call in an `async` function to avoid blocking the FastAPI event loop.
*   **For the Frontend Engineer:** Use a "Skeleton Loader" or "Shimmer" effect when the AI is processing to make the app feel "premium."
*   **For the Video:** Record the screen at 60fps and use a clean, sans-serif font for any text overlays. Keep the background music subtle but upbeat.
