type Input = {
    route: string;
    userName: string;
    payload: any;
}

export class InputTracker {
    private inputs: Input[] = [];

    constructor() { }

    public saveInput(input: Input) {
        this.inputs.push(input);
    }

    public getInputs() {
        return this.inputs;
    }
}
