let accessToken; 
const clientId = '';
const redirectUri = 'http://jam-seracher.surge.sh';

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            console.log(accessToken);
            return accessToken; 
        } 

        // check if the expiration and tocken are in the url sent back by Spotify
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            let expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            console.log(accessToken);
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location.href = accessUrl; 
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken(); 
        console.log(accessToken);       
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
            console.log(response);
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse) {
                return [];
            } else {
                console.log(jsonResponse);
                return jsonResponse.tracks.items.map(track => {
                    return {
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }
                })
            }
        })
    },

    savePlaylist(name, trackUris) {
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userId; 

        return fetch(`https://api.spotify.com/v1/me`, {
            headers: headers
        }).then(response => {
            console.log(response);
            return response.json();
        }).then(jsonResponse => {
            console.log(jsonResponse);
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name })
            }).then(response => {
                console.log(response);
                return response.json();
            }).then(jsonResponse => {
                console.log(jsonResponse);
                let playlistID = jsonResponse.id
                return fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackUris })
                })
            })
        })
    }
}; 



export default Spotify;