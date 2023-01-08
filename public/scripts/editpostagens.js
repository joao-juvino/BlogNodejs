const options = [...document.getElementById("categoria").children]

options.forEach(option => {
    if (option.attributes.selected.value == "true") {
        option.selected = true
    }
})