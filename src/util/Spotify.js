let accessToken;
const clientId = '';
const redirectUri = 'http://localhost:3000/';

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken; 
        }

        let accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        let expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            let expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }        
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (jsonResponse.tracks) {
                return jsonResponse.tracks.map(track => {
                    return {
                        id: track.id,
                        name: track.name, 
                        artist: track.artist[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }
                })
            } else {
                return [];
            }
        })
    },

    savePlaylist(playlistName, trackUri) {
        if (!playlistName || !trackUri) {
            return;
        } else {
            const accessToken = Spotify.getAccessToken();
            const headers = { Authorization: `Bearer ${accessToken}`} ;
            let userId ;
            fetch('https://api.spotify.com/v1/me', {
                headers: headers
            }).then(response => {
                return response.json();
            }).then(jsonResponse => {
                return userId = jsonResponse.id;
            })
        }
    }
};

export default Spotify;