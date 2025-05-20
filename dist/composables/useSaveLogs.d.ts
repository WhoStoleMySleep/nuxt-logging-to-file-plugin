export declare function useSaveLogs(logText: {
    time: string;
    type: string;
    value: any;
}, apiEndpoint: string): Promise<void | Response> | undefined;
