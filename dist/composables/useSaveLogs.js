export function useSaveLogs(logText, apiEndpoint) {
    let value = 'url' in logText.value
        ? logText.value
        : Array.from(logText.value).filter((item) => typeof item === 'string');
    delete logText?.value;
    if (value) {
        return fetch(apiEndpoint, {
            method: 'POST',
            body: JSON.stringify({
                text: JSON.stringify({
                    ...logText,
                    value
                })
            })
        }).catch((error) => {
            console.error('Failed to send log:', error);
        });
    }
}
