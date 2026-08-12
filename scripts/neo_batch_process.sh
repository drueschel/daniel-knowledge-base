#!/bin/bash

# Array of [filename_prefix] [url_slug]
declare -a VIDEOS=(
  "03_The_ABC_of_States somatic-evolution-the-abc-of-states"
  "04_What_is_an_Emotion somatic-evolution-what-is-an-emotion"
  "05_Emotions_Instincts_Feelings somatic-evolution-emotions-instincts-feelings"
  "06_The_Path_of_Feeling somatic-evolution-the-path-of-feeling"
  "07_Two_Types_of_Consciousness somatic-evolution-two-types-of-consciousness"
  "08_Emotions_Map_Anger_Fear somatic-evolution-emotions-map-anger-fear"
  "09_Joy somatic-evolution-joy"
  "10_Sadness somatic-evolution-sadness"
  "11_Anti_Emotions somatic-evolution-anti-emotions"
)

OUT_DIR="tmp_transcripts"
mkdir -p "$OUT_DIR"

for item in "${VIDEOS[@]}"; do
  # Split the item string into name and slug
  NAME=$(echo $item | cut -d' ' -f1)
  SLUG=$(echo $item | cut -d' ' -f2)
  URL="https://members.emotionalreleases.com/posts/$SLUG"
  TS_FILE="$OUT_DIR/$NAME.ts"
  TXT_FILE="$OUT_DIR/$NAME.txt"

  echo "=================================================="
  echo "Processing $NAME..."
  echo "URL: $URL"
  echo "=================================================="

  if [ -f "$TXT_FILE" ]; then
    echo "Transcript $TXT_FILE already exists, skipping download."
    continue
  fi

  if [ ! -f "$TS_FILE" ]; then
    echo "Downloading video to $TS_FILE..."
    NODE_PATH=$(npm root -g) node scripts/neo_download_video.js "$URL" "$TS_FILE"
  fi

  if [ -f "$TS_FILE" ]; then
    echo "Transcribing $TS_FILE..."
    node scripts/neo_transcribe.js "$TS_FILE" "$OUT_DIR"
    
    # Optional: Delete the large .ts file after successful transcription to save space
    if [ -f "$TXT_FILE" ]; then
      echo "Transcription successful. Cleaning up $TS_FILE..."
      rm "$TS_FILE"
    fi
  else
    echo "Failed to download $TS_FILE from $URL"
  fi
done

echo "Batch processing complete."
