document.getElementById("convert").onclick = function (ev) {
    var files = document.getElementById("file").files;

    for (let i = 0; i < files.length; i++) {
        handleFile(files[i]);
    }
}

function handleFile(file) {
    JSZip
        .loadAsync(file)
        .then(function (archive) {

            let project = archive.file("project.json");
            return project.async("text").then(JSON.parse)
                .then(object => {
                    if (object.scripts) {
                        fixScripts(object.scripts);
                    }
                    if (object.children) {
                        object.children.forEach(child => {
                            if (child.scripts) {
                                fixScripts(child.scripts);
                            }
                        });
                    }
                    object.info.savedExtensions.forEach(fixExtension);
                    return object;
                }).then(JSON.stringify)
                .then(file => {
                    archive.file("project.json", file);
                    return archive.generateAsync({ type: "blob" });
                }).catch(reason => {
                    alert("Something went wrong with converting " + file.name + ".");
                });
        }).then(blob => {
            if (blob)
                saveAs(blob, file.name.replace(".sbx", ".converted.sbx"));
        }).catch(() => {
            alert("Something went wrong with parsing " + file.name + ". Are you sure this is a \".sbx\" project file saved from ScratchX?");
        });
}

let blockReplacements = {
    "Hummingbird\u001fgetRaw": "Hummingbird\u001fgetRotary"
};

function fixScripts(scripts) {
    scripts.forEach(script => {
        script = script[2];
        script.forEach(fixBlock);
    });
}

function fixBlock(block) {
    if (block[0] in blockReplacements) {
        block[0] = blockReplacements[block[0]];
    }
    for (let i = 0; i < block.length; i++) {
        let slot = block[i];
        if (slot instanceof Array) {
            fixBlock(slot);
        }
    }
}

function fixExtension(extension) {
    if (new RegExp("https?://birdbraintechnologies\\.github\\.io/Chrome-Scratch-and-Snap-Support/Scratch( |%20)Plugins/HummingbirdHID_Scratch\\(Chrome( |%20)Plugin\\)(/v0\\.7\\.2)?\\.js").test(extension.javascriptURL)) {
        extension.javascriptURL = "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/HummingbirdHID_Scratch(Chrome Plugin)/v1.0.js";
        extension.blockSpecs[8][2] = "getRotary";
        extension.blockSpecs[9][2] = "getLight";
    }
    if (new RegExp("https?://birdbraintechnologies\\.github\\.io/Chrome-Scratch-and-Snap-Support/Scratch( |%20)Plugins/FinchHID_Scratch\\(Chrome( |%20)Plugin\\)(/v0\\.7\\.5)?\\.js").test(extension.javascriptURL)) {
        extension.javascriptURL = "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/FinchHID_Scratch(Chrome Plugin)/v1.0.js";
    }

    if (extension.javascriptURL === "http://birdbraintechnologies.github.io/Chrome-Scratch-and-Snap-Support/Scratch Plugins/HummingbirdHID_Scratch(Chrome Plugin)/v1.0.js") {
        extension.blockSpecs[4][0] = 'b';   // convert the obstacle blocks into booleans
        extension.blockSpecs[5][0] = 'b';
    }
}