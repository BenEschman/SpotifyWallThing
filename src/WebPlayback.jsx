import React, { useState, useEffect } from "react";
import Search from "./Search";
import Play from "./images/play.png";
import Pause from "./images/pause.png";
import "./WebPlayback.css"; // Custom CSS for Spotify-like styling

function WebPlayback({ token }) {
  const [player, setPlayer] = useState(undefined);
  const [isPaused, setPaused] = useState(false);
  const [isActive, setActive] = useState(false);
  var contextUri = null;
  const [currentTrack, setTrack] = useState({
    name: "",
    album: { images: [{ url: "" }] },
    artists: [{ name: "" }],
  });
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!token) {
        console.error("No valid token provided");
        return;
      }

      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        fetch(`https://api.spotify.com/v1/me/player`, {
          method: "PUT",
          body: JSON.stringify({ device_ids: [device_id], play: false }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch((err) => console.error("Error transferring playback:", err));
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
        player.getCurrentState().then((state) => (!state ? setActive(false) : setActive(true)));
      });

      player.connect();
    };
  }, [token]);

  const handleSearch = (query) => {
    fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSearchResults(data.tracks.items))
      .catch((err) => console.error("Error fetching search results:", err));
  };

  const playTrack = (track) => {
      contextUri = track.album.contextUri || null;
      const body = contextUri ? { context_uri: contextUri, offset: { uri: track.uri } } : {uri: track.uri};
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch((err) => console.error("Error playing track:", err));
    fetch('https://api.spotify.com/v1/me/player/shuffle?state=true', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch((err) => console.error("Error playing track:", err));
    setSearchResults([]); // Clear search results after playing
  };

  return (
    <div className="spotify-container">
      {/* Sidebar */}
      <aside className="spotify-sidebar">
        <h1>Spotify Clone</h1>
        <nav>
          <ul>
            <li>Home</li>
            <li>Search</li>
            <li>Your Library</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="spotify-main">
        {/* Search Bar */}
        <div className="search">
        <Search onSearch={handleSearch} className="searchBar"/>
        </div>
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((track) => (
              <div key={track.id} className="track-item" onClick={() => {playTrack(track); setSearchResults([]);}}>
                  <button onClick={() => {playTrack(track); setSearchResults([]);}}>
                      <img src={track.album.images[0]?.url} alt={track.name} />
                  </button>

                <div>
                  <p>{track.name}</p>
                  <p>{track.artists.map((artist) => artist.name).join(", ")}</p>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Now Playing */}
        <div className="now-playing">
          <img src={currentTrack.album.images[0]?.url} alt={currentTrack.name} />
          <div>
            <h4>{currentTrack.name}</h4>
            <p>{currentTrack.artists.map((artist) => artist.name).join(", ")}</p>
          </div>
          <button onClick={() => player?.previousTrack()}>&gt;&gt;
              </button>
          <button onClick={() => player?.togglePlay()}style={{
                                                          background: 'transparent',
                                                          border: 'none',
                                                          padding: '0',
                                                          cursor: 'pointer'
                                                        }}>{isPaused ?
           (<img src={Play} alt="play"  style={{ width: '60px', height: '60px', backgroundColor: 'transparent' }}/>)
           : (<img src={Pause} alt="pause"  style={{ width: '60px', height: '60px', backgroundColor: 'transparent' }}/>)}
              </button>
          <button onClick={() => player?.nextTrack()}>&gt;&gt;</button>
        </div>
      </main>
    </div>
  );
}

export default WebPlayback;
