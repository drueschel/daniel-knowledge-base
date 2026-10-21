#!/bin/bash
set -e

cd /Users/danielrueschel/DEV/daniel-knowledge-base/tmp_downloads/gopal

echo "=== Transcribing 30. August Teil 1 with -mc 128 ==="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -mc 128 -f "Live_Call_30_August_Teil_1_Angst_und_Panik.wav" -osrt -otxt

echo "=== Transcribing 04. Oktober with -mc 128 ==="
/opt/homebrew/bin/whisper-cli \
  -m /Users/danielrueschel/.cache/whisper/ggml-small.bin \
  -l de -mc 128 -f "Live_Call_04_Oktober_Angst_und_Panik.wav" -osrt -otxt

echo "=== Clean transcription complete! ==="
