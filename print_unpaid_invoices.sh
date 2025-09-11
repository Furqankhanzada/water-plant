#!/usr/bin/env bash
set -euo pipefail

# --- config ---
: "${YOUR_API_KEY:?Set YOUR_API_KEY first: export YOUR_API_KEY='...'}"
PRINTER="${PRINTER:-Your_Printer_Name}"
API_URL='https://ldw.furqan.codes/api/invoice?depth=0&select%5Bstatus%5D=true&pagination=false&where%5Bor%5D%5B0%5D%5Band%5D%5B0%5D%5Bstatus%5D%5Bequals%5D=unpaid&where%5Bor%5D%5B0%5D%5Band%5D%5B1%5D%5BisLatest%5D%5Bequals%5D=true'
PDF_NEEDS_AUTH="${PDF_NEEDS_AUTH:-0}"   # set to 1 if the PDF endpoint needs the same header
PARALLEL="${PARALLEL:-4}"               # change for speed vs printer load
LOG_OK="printed.ok.log"
LOG_FAIL="printed.fail.log"

# --- deps ---
command -v jq >/dev/null || { echo "Please install jq (brew install jq)"; exit 1; }

# --- fetch IDs and make a tab-separated list of (url, id) ---
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

curl -fsS -H "Authorization: users API-Key ${YOUR_API_KEY}" "$API_URL" \
| jq -r '
    (if has("docs") then .docs else . end)
    | .[]
    | (.id // ._id) as $id
    | select($id)
    | "https://ldw.furqan.codes/invoices/\($id)/pdf\t\($id)"
' > "$TMP"

# --- print in parallel with logging ---
: > "$LOG_OK"; : > "$LOG_FAIL"

# Create output directory for PDFs
PDF_DIR="unpaid_invoices_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$PDF_DIR"
echo "📁 Saving PDFs to directory: $PDF_DIR"

# Process each line one by one with delays
total_invoices=$(wc -l < "$TMP")
current=0

while IFS=$'\t' read -r url id; do
  current=$((current + 1))
  echo "Processing invoice ${id} (${current}/${total_invoices}) ..."
  
  # Download PDF with proper delays and validation
  pdf_file="$PDF_DIR/invoice_${id}.pdf"
  
  if [[ "${PDF_NEEDS_AUTH}" == "1" ]]; then
    # Download with authentication
    if curl -fsSL --retry 3 --retry-delay 3 --max-time 30 \
       -H "Authorization: users API-Key ${YOUR_API_KEY}" \
       -H "Accept: application/pdf" \
       -o "$pdf_file" "$url"; then
      
      # Wait a moment for the file to be fully written
      sleep 1
      
      # Validate PDF file
      if [[ -f "$pdf_file" && -s "$pdf_file" ]]; then
        # Check if it's a valid PDF by looking for PDF header
        if head -c 4 "$pdf_file" | grep -q "%PDF"; then
          echo "✅ OK  $id  $url (saved to $pdf_file)" | tee -a "$LOG_OK"
        else
          echo "❌ ERR $id  $url (invalid PDF format)" | tee -a "$LOG_FAIL" >&2
          rm -f "$pdf_file"
        fi
      else
        echo "❌ ERR $id  $url (empty or missing file)" | tee -a "$LOG_FAIL" >&2
        rm -f "$pdf_file"
      fi
    else
      echo "❌ ERR $id  $url (download failed)" | tee -a "$LOG_FAIL" >&2
    fi
  else
    # Download without authentication
    if curl -fsSL --retry 3 --retry-delay 3 --max-time 30 \
       -H "Accept: application/pdf" \
       -o "$pdf_file" "$url"; then
      
      # Wait a moment for the file to be fully written
      sleep 1
      
      # Validate PDF file
      if [[ -f "$pdf_file" && -s "$pdf_file" ]]; then
        # Check if it's a valid PDF by looking for PDF header
        if head -c 4 "$pdf_file" | grep -q "%PDF"; then
          echo "✅ OK  $id  $url (saved to $pdf_file)" | tee -a "$LOG_OK"
        else
          echo "❌ ERR $id  $url (invalid PDF format)" | tee -a "$LOG_FAIL" >&2
          rm -f "$pdf_file"
        fi
      else
        echo "❌ ERR $id  $url (empty or missing file)" | tee -a "$LOG_FAIL" >&2
        rm -f "$pdf_file"
      fi
    else
      echo "❌ ERR $id  $url (download failed)" | tee -a "$LOG_FAIL" >&2
    fi
  fi
  
  # Add delay between downloads to prevent overwhelming the server
  echo "⏳ Waiting 2 seconds before next download..."
  sleep 2
  
done < "$TMP"

# Summary
echo ""
echo "📊 Summary:"
echo "✅ Successfully downloaded: $(wc -l < "$LOG_OK") invoices"
echo "❌ Failed downloads: $(wc -l < "$LOG_FAIL") invoices"
echo "📁 PDFs saved in: $PDF_DIR"
echo "📝 Success log: $LOG_OK"
echo "📝 Error log: $LOG_FAIL"

# export YOUR_API_KEY='paste-key-here'
# export PRINTER='Your_Printer_Name'
# If PDFs require auth too:
# export PDF_NEEDS_AUTH=1
# ./print_unpaid_invoices.sh