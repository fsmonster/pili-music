import { defineStore } from 'pinia'

interface AudioTrack {
  id: string
  title: string
  artist: string
  cover: string
  audioUrl: string
}

interface PlayerState {
  currentTrack: AudioTrack | null
  playlist: AudioTrack[]
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0
  }),
  
  actions: {
    setTrack(track: AudioTrack) {
      this.currentTrack = track
    },
    
    setPlaylist(playlist: AudioTrack[]) {
      this.playlist = playlist
    },
    
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },
    
    setVolume(volume: number) {
      this.volume = Math.max(0, Math.min(1, volume))
    },
    
    updateTime(time: number) {
      this.currentTime = time
    },
    
    setDuration(duration: number) {
      this.duration = duration
    }
  }
})
