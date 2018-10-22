document.getElementById("file").onchange = function(ev) {
    var files = ev.target.files;

    for (let i = 0; i < files.length; i++) {
        handleFile(files[i]);
    }
}

function handleFile(file) {
    JSZip
        .loadAsync(file)
        .then(function(archive) {

            let project = archive.file("project.json");
            return project.async("text").then(JSON.parse)
                .then(object => {
                    console.log(object);
                    object.scripts.forEach(script => {
                        script = script[2];
                        script.forEach(fixBlock);
                    });
                    object.info.savedExtensions.forEach(fixExtension);
                    return object;
                }).then(JSON.stringify)
                .then(file => {
                    archive.file("project.json", file);
                    return archive.generateAsync({type: "blob"});
                });
        }).then(blob => {
            saveAs(blob, file.name.replace(".sbx", ".converted.sbx"));
        }).catch(() => {
            alert("Something went wrong with converting " + file.name + ". Are you sure this is a \".sbx\" project file saved from ScratchX?");
        });
}

let blockReplacements = {
    "Hummingbird\u001fgetRaw": "Hummingbird\u001fgetRotary"
};

function fixBlock(block) {
    if (block[0] in blockReplacements) {
        block[0] = blockReplacements[block[0]];
    }
    for (let i = 1; i < block.length; i++) {
        let slot = block[i];
        if (slot instanceof Array) {
            fixBlock(slot);
        }
    }
}

function fixExtension(extension) {
    if (extension.javascriptURL === "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/HummingbirdHID_Scratch(Chrome Plugin)/v0.7.2.js"
    || extension.javascriptURL === "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/HummingbirdHID_Scratch(Chrome Plugin)/v0.7.2.js") {
        extension.javascriptURL = "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/HummingbirdHID_Scratch(Chrome Plugin)/v1.0.js";
        extension.blockSpecs[8][2] = "getRotary";
        extension.blockSpecs[9][2] = "getLight";
    }
    if (extension.javascriptURL === "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/FinchHID_Scratch(Chrome Plugin).js"
    || extension.javascriptURL === "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/FinchHID_Scratch(Chrome Plugin)/v0.7.5.js") {
        extension.javascriptURL = "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/FinchHID_Scratch(Chrome Plugin)/v1.0.js";
    }
    console.log(extension);
}