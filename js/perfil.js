const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

setCookie("addtl_consent", "1~", 90);
setCookie("euconsent-v2", "CQh7pEAQh7pEAAKA1AESCYFgAAAAAEPgAACIAAAYeABMNCogjLIgUCBQEIIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASIyqDTAlAASCAlsqEEoGBBXCFIscAggREwUAAAIABQAAID4WAhJKCViQQBcQXQAAEAAAUQIkCKQswBBUGaLQVgScBkaYBk-YJklOgyAJghIyDIhNUEg8UxRCghyA2KWYA6eIKAGXayQh_gAAAAA.YAAAAAAAAAAA", 90);

window.localStorage.setItem("_cmpRepromptHash", "CQh7pEAQh7pEAAKA1AESCYFgAAAAAEPgAACIAAAYeABMNCogjLIgUCBQEIIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAIACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASIyqDTAlAASCAlsqEEoGBBXCFIscAggREwUAAAIABQAAID4WAhJKCViQQBcQXQAAEAAAUQIkCKQswBBUGaLQVgScBkaYBk-YJklOgyAJghIyDIhNUEg8UxRCghyA2KWYA6eIKAGXayQh_gAAAAA.YAAAAAAAAAAA.1.jjXiZplvqkcl8hSvn6qOuA==");

console.log("Se activó Diarios Liberados");