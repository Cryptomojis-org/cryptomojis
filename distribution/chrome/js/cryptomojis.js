function revealCryptomojis() {
    try {
        console.log('Let\'s reveal some Cryptomojis!');

        function nodeSelector() {
            let results = [];
            const nodeList = document.querySelectorAll('body, body *') ;
            for (const node of nodeList) {
                if (node.hasChildNodes()) {
                    const childNode = node.childNodes[0];
                    const condition1 = childNode.nodeType === 3;
                    let condition2 = true;
                    condition2 = node.nodeName !== 'SCRIPT';
                    if (condition1 && condition2) {
                        results.push(node)
                    }
                }
            }
            return results;
        }

        const nodes = nodeSelector();

        const imgSrc = 'https://www.pngkit.com/png/full/1-11262_doge-lmfao-doge-emoji.png';
        const cryptomoji = ` <img width="50px" height="50px" src=${imgSrc} style="all: unset; height: 50px; width: 50px;" /> `;
        for (const node of nodes) {
            console.log(node.childNodes[0]);
            if (node.innerHTML.startsWith('window')) {
                console.log(node.childNodes[0]);
            };
            node.innerHTML = node.innerHTML.replace( /:cryptomoji+doge:/g, cryptomoji);
        }

    } catch (error) {
        console.log(error);
    }
}
window.addEventListener('load', function () {
    revealCryptomojis();
    setTimeout(function () { revealCryptomojis(); }, 5000);
});


