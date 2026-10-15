YOUR SONG IS HERE
=================

The file in this folder is:

    birthday-song.mp3

That is the path already configured in
src/config/siteConfig.ts  ->  audio.src = '/audio/birthday-song.mp3'

REPLACING IT
------------
Just delete birthday-song.mp3 and drop in your own file with the same name.
Nothing else needs editing.

Want a different filename? Either keep the name `birthday-song.mp3`, or change
`audio.src` in src/config/siteConfig.ts to match your file, e.g.
'/audio/our-song.mp3'.

OTHER SETTINGS (src/config/siteConfig.ts -> audio)
--------------------------------------------------
  loop             true  = keeps playing while moving between screens
  volume           0.45  = 0 (silent) to 1 (loudest)
  startOnFirstTap  false = visitor must tap the music button

Note: the file is ~9.4 MB. That is fine on Wi-Fi, but if you notice the page
taking a moment on mobile data, trimming the song to 3-4 minutes helps a lot.

Please only use music you own or have permission to use.