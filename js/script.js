console.log("Lets start javascript...")
let currentSong = new Audio();
let songs;
let currFolder;

function convertSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = parseInt(seconds % 60);

    // Format with leading zeros if necessary
    minutes = minutes < 10 ? '0' + minutes : minutes;
    remainingSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return minutes + ':' + remainingSeconds
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    //In JavaScript, "response" typically refers to the data received from a server after making a request, often
    // used in the context of fetching data from an API.
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    //Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
    
                            <img class="invert svgsize" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")} </div>
                                <div>Sudhanshu</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="svgsize invert" src="img/play.svg" alt="play">
                            </div></li>`;
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

        })
    });

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio(`/${folder}/`+track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {

        currentSong.play();
        play.src = "img/pause.svg"

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes("htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `
             <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="img/play-button.svg" alt="play-button">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="image">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>
            `

        }
    }

    //Load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {   //async used bit differenlty, note it 
            // console.log(item, item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])

        })
    })

}

async function main() {

    //get the list of all the songs
    await getSongs("songs/cs")
    // console.log(songs)
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums();


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else if (currentSong.play) {
            currentSong.pause()
            play.src = "img/play.svg"
        }

    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {

        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = convertSeconds(currentSong.currentTime)
            + "/" + convertSeconds(currentSong.duration)
        //moving circlewhile song playing...
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect(), e.offsetX)
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    //Add an event listener to previous
    previous.addEventListener("click", () => {
        console.log(currentSong)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index)
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    })

    //Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        // console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs, index)
        if ((index + 1) < (songs.length)) {

            playMusic(songs[index + 1])
        }

    })

    //Add an event to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to ", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg", "volume.svg")
        }
        else if (currentSong.volume == 0){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("volume.svg","mute.svg" )
        }
    })

    //Add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = .1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })


}



main()