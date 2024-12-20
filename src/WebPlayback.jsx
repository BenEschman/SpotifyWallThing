import React, { useState, useEffect } from 'react';

function WebPlayback(props) {
  const [player, setPlayer] = useState(null);  // State to store the player instance

  useEffect(() => {
    // Dynamically load the Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    // Append the script to the document body
    document.body.appendChild(script);

    // Once the SDK is loaded, initialize the player
    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { cb(props.token); },  // Pass the access_token as a callback
        volume: 0.5,  // Set the default volume
      });

      // Store the player instance in local state
      setPlayer(newPlayer);

      // Listen for the 'ready' event
      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('The Web Playback SDK is ready with device ID', device_id);
      });

      // Listen for the 'not_ready' event
      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect the player to the Spotify service
      newPlayer.connect();
    };

    // Cleanup function to disconnect the player if the component unmounts
    return () => {
      if (player) {
        player.disconnect();
      }
    };

  }, [props.token]);  // Dependency array now only includes props.token

  return (
    <div className="container">
      <div className="main-wrapper">
        <h1>Spotify Web Playback</h1>
        <p>Enjoy your music!</p>
      </div>
    </div>
  );
}

export default WebPlayback;
