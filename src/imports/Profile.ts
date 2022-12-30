export const measureCPU = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
	const originalMethod = descriptor.value;

	descriptor.value = function (...args: any) {
		const start = Game.cpu.getUsed();
		const result = originalMethod.apply(this, args);
		const finish = Game.cpu.getUsed();
		console.log(`Execution cpu: ${finish - start}`);
		return result;
	};

	return descriptor;
};

export class Profiler {
    @measureCPU
    public static test() {
        for (let i = 0; i < 10; i++) {
            const b = 1 + 5;
        }
    }
}
