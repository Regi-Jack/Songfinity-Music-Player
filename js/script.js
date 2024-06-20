let currSong = new Audio();
let flag = 0;
let songLinks;
let songName;
let folders;
let currFolder;

async function getFolders() {
    let data = await fetch(`/music/`);
    data = await data.text();
    //make a div
    let div = document.createElement("div");
    //store fetched text as HTML
    div.innerHTML = data;
    //get <a href> links
    let folderNames = div.getElementsByTagName("a");
    let folders = [];
    let i = 0;
    for (let index = 0; index < folderNames.length; index++) {
        const element = folderNames[index];
        if(!element.href.includes(".htaccess") && element.href.includes("music")) {
            folders[i] = element.href;
            folders[i] = folders[i].split("music/")[1];
            i++;
        }
    }
    return folders;
}

async function getSongLinks(folder) {
    currFolder = folder;
    let data = await fetch(`/music/${currFolder}/`);
    data = await data.text();

    //make a div
    let div = document.createElement("div");

    //store fetched text as HTML
    div.innerHTML = data;

    //get <a href> links
    let songlinks = div.getElementsByTagName("a");

    //filter out only those <a href> which end with .mp3
    let songs = [];
    let i = 0;
    for (let index = 0; index < songlinks.length; index++) {
        const element = songlinks[index];
        if (element.href.endsWith(".mp3")) {
            songs[i] = element.href;
            i++;
        }
    }
    return songs;
}

async function extractSongName(songs) {
    let songName = [];
    //regular expression
    const regex = /([^/]+)\.mp3$/;
    for (let index = 0; index < songs.length; index++) {
        const match = songs[index].match(regex);
        songName[index] = match ? match[1] : "";
    }

    for (let index = 0; index < songName.length; index++) {
        songName[index] = decodeURIComponent(songName[index]);
        songName[index] += ".mp3";
    }
    return songName;
}

function playMusic(song) {
    currSong.src = `/music/${currFolder}/` + song;
    currSong.play();

    currSong.addEventListener("canplaythrough", function handler() {
        currSong.play();
    });
    document.getElementById("playButton").src = "svgs/pause.svg";
    document.querySelector(".songInfo").innerHTML = song;
}

async function displayAlbum() {
    songLinks = await getSongLinks(`${currFolder}`);
    songName = await extractSongName(songLinks);

    let html = ``;
    document.querySelector(".playlist").innerHTML = "";
    for (let index = 0; index < songLinks.length; index++) {
        html = `<li class="flex invert">
        <img src="svgs/music.svg" alt="music">
        <div class="playlistSongInfo invert">${songName[index]}</div>
        </li>`;
        document.querySelector(".playlist").innerHTML += html;
    }

    // Default Audio
    // document.querySelector(".songInfo").innerHTML = songName[0];
    // currSong.src = songLinks[0];
    // currSong.addEventListener("loadeddata", () => {
    //     currSong = audio;
    //     let durationInSeconds = audio.duration;
    //     let minutes = Math.floor(durationInSeconds / 60);
    //     let seconds = Math.floor(durationInSeconds % 60);
    //     document.querySelector(".songTime").innerHTML =
    //         "0:0 / " + minutes + ":" + seconds;
    // });

    let playlist = document
        .querySelector(".playlist")
        .getElementsByTagName("li");
    for (let index = 0; index < playlist.length; index++) {
        playlist[index].addEventListener("click", () => {
            playMusic(playlist[index].lastElementChild.innerHTML);
        });
    }
}

async function main() {
    folders = await getFolders();
    let html = ``;
    for (let index = 0; index < folders.length; index++) {
        html = `<li>
                <img class="invert" src="/music/${folders[index].slice(0,-1)}/cover.jpg" alt="musicFolder">
                <div class="folderName">${decodeURI(folders[index]).slice(0,-1)}</div>
                </li>`;
        document.querySelector(".insertFolders").innerHTML += html;
    }
    
    let folderList = document
        .querySelector(".insertFolders")
        .getElementsByTagName("li");
    for (let index = 0; index < folderList.length; index++) {
        folderList[index].addEventListener("click", async () => {
            currFolder = folderList[index].lastElementChild.innerHTML;
            await displayAlbum();

            const viewportWidth = window.innerWidth;
            if(viewportWidth <= 1100) {
                document.querySelector(".left").style.left = 0+"%";
            }

        });
    }

    document.getElementById("playButton").addEventListener("click", () => {
        if (currSong.paused) {
            document.getElementById("playButton").src = "svgs/pause.svg";
            currSong.play();
        } else {
            document.getElementById("playButton").src = "svgs/play.svg";
            currSong.pause();
        }
    });

    currSong.addEventListener("timeupdate", () => {
        let durationInSeconds = currSong.currentTime;
        let currMin = Math.floor(durationInSeconds / 60);
        let currSec = Math.floor(durationInSeconds % 60);
        durationInSeconds = currSong.duration;
        if (isNaN(durationInSeconds)) {
            document.querySelector(".songTime").innerHTML = "0:00/0:00";
        } else {
            let totalMin = Math.floor(durationInSeconds / 60);
            let totalSec = Math.floor(durationInSeconds % 60);
            document.querySelector(".songTime").innerHTML =
                currMin + ":" + currSec + " / " + totalMin + ":" + totalSec;

            document.querySelector(".seekball").style.left =
                (currSong.currentTime / currSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent =
            (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".seekball").style.left = percent + "%";
        currSong.currentTime = (currSong.duration * percent) / 100;
    });

    document.querySelector(".previous").addEventListener("click", () => {
        let index = songLinks.indexOf(currSong.src);
        if (index - 1 >= 0) {
            playMusic(songName[index - 1]);
        }
    });

    document.querySelector(".next").addEventListener("click", () => {
        let index = songLinks.indexOf(currSong.src);
        if (index + 1 < songLinks.length) {
            playMusic(songName[index + 1]);
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0 + "%";
    });

    document.querySelector(".crossIcon").addEventListener("click", () => {
        document.querySelector(".left").style.left = -100 + "%";
    });

    // -------------------------------------------------------------------------------
}
main();
