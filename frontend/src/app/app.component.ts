import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterModule],
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('statusDiv') statusDiv!: ElementRef;
  @ViewChild('statusH1') statusH1!: ElementRef;
  @ViewChild('listContainer') listContainer!: ElementRef;

  isRecording = false;
  mediaRecorder!: MediaRecorder;
  audioChunks: Blob[] = [];

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
        this.audioChunks = [];

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recorded-audio.mp3');

        this.statusDiv.nativeElement.textContent = 'Uploading...';

        try {
          const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          const result = await response.json();
          this.statusDiv.nativeElement.innerHTML = `
            ✅ Upload complete! <a href="${result.url}" target="_blank">Play Audio</a>
          `;
        } catch (err) {
          console.error('Upload failed:', err);
          this.statusDiv.nativeElement.textContent = '❌ Upload failed';
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      this.statusDiv.nativeElement.textContent = '❌ Microphone access denied';
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  async transcribe() {
    try {
      const response = await fetch('http://localhost:3000/transcribe', {
        method: 'POST',
      });

      const text = await response.text();
      let word = this.statusH1.nativeElement;
      word.textContent = text; // 👈 Clear intent
    } catch (err) {
      console.error('Transcription failed:', err);
      alert('Transcription failed. Check console for details.');
    }
  }
}
