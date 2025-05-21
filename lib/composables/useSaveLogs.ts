export interface LogData {
  time: string;
  type: string;
  value: any[];
}

export async function useSaveLogs(logText: LogData, apiEndpoint: string) {
  if (!logText.value || !logText.value.length) {
    console.warn('Skipping empty log:', logText);
    return;
  }

  if (typeof window === 'undefined') {
    console.warn('Skipping useSaveLogs in SSR:', logText);
    return;
  }

  try {
    console.log('useSaveLogs sending:', JSON.stringify(logText));
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: JSON.stringify(logText),
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send log:', error);
  }
}