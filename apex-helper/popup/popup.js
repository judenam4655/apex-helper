const startButton = document.getElementById('get-data');
const copyButton = document.getElementById('copy-data')
// const loginButton = document.getElementById('login');

startButton.onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const resultsType1 = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => [
            document.getElementsByTagName('kp-sia-question')[0].textContent,
            document.getElementsByClassName('course-title ng-star-inserted')[0].textContent,
            // document.getElementsByClassName('toolbar-title-ula ng-star-inserted')[0].textContent
            // document.getElementsByClassName('sia-form ng-untouched ng-pristine ng-invalid ng-star-inserted')[0].textContent
            document.getElementsByClassName('sia-question-stem')[0].textContent, 
            document.getElementById('sia-multiple-choice-label-0').textContent, 
            document.getElementById('sia-multiple-choice-label-1').textContent, 
            document.getElementById('sia-multiple-choice-label-2').textContent, 
            document.getElementById('sia-multiple-choice-label-3').textContent,
            document.querySelectorAll('span.sia-choice-letter').length,
        ]

        // document.getElementById('sia-multiple-choice-label-4').textContent]
        // document.getElementsByClassName('sia-distractor-4')[0].textContent] // We can directly return the data we want
    });

    
    let query = resultsType1[0].result;

    // ======chat-gpt input&output=======
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model: "gpt-4.1",
            instructions: "Answer accurately with questions about " + query[1] + ". MUST answer in format of \"Letter.\"",
            input: `${query[0]}`,
            tools: [{ type: "web_search_preview" }]
        })
    });

    let data = await response.json();
    // =============================
    let result = `분석 실패 또는 API키 없음`;
    try {
        result = `${data.output[1].content[0].text}`;
    }
    catch (error) {
        result = `${data.output[0].content[0].text}`;
    }

    document.getElementById('result').textContent = result;

    document.getElementById('prompt').textContent = query[0]
    document.getElementById('courseTitle').textContent = query[1];
    document.getElementById('question').textContent = query[2];
    document.getElementById('choice-a').textContent = query[3];
    document.getElementById('choice-b').textContent = query[4];
    document.getElementById('choice-c').textContent = query[5];
    document.getElementById('choice-d').textContent = query[6];
    if (query[7] == 5) {
        document.getElementById('choice-e').textContent = query[0].substring(query[0].lastIndexOf("E."), query[0].length);
    }
    
    if (resultFormatter(result) != ""){
        document.getElementById(resultFormatter(result)).classList.add("correct");
    }
};

function resultFormatter(result) {
    let choices = ["A.", "B.", "C.", "D.", "E.", "a.", "b.", "c.", "d.", "e."];
    let format = {
        "A.":"choice-a", 
        "B.":"choice-b", 
        "C.":"choice-c", 
        "D.":"choice-d", 
        "E.":"choice-e", 
        "a.":"choice-a", 
        "b.":"choice-b", 
        "c.":"choice-c", 
        "d.":"choice-d", 
        "e.":"choice-e"
    };

    for (let i=0; i<choices.length; i++){
        if(result.search(choices[i]) != -1){
            return format[choices[i]];
        }
    }

    return "";
}

copyButton.onclick = async() => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const resultsType1 = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => [
            document.getElementsByTagName('kp-sia-question')[0].textContent,
        ]
    });
    
    let query = resultsType1[0].result;

    navigator.clipboard.writeText(query[0]);
}