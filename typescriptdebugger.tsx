import React, { useState, useEffect, useCallback } from 'react'; // Type definitions interface LearningExample { title: string; code: string; description?: string; } interface TypeScriptError { code: number; message: string; line?: number; column?: number; start?: number; length?: number; } interface ErrorExplanation { [key: number]: string; } // TypeScript compiler types (simplified) declare global { interface Window { ts: any; } } const TypeScriptDebugger: React.FC = () => { const [code, setCode] = useState(`// Welcome to the TypeScript Learning Debugger! // Try fixing these type errors: let message: string = 42; let numbers: number[] = [1, 2, "three"]; interface User { name: string; age: number; } let user: User = { name: "Alice", email: "alice@example.com" };`); const [errors, setErrors] = useState([]); const [isLoading, setIsLoading] = useState(true); const [tsLoaded, setTsLoaded] = useState(false); const learningExamples: LearningExample[] = [ { title: 'Basic Type Mismatch', description: 'Learn about primitive type assignments', code: `let name: string = 42; let age: number = "hello"; let isActive: boolean = "yes";` }, { title: 'Array Type Errors', description: 'Understanding array type constraints', code: `let numbers: number[] = [1, 2, "three", 4]; let strings: string[] = ["hello", 42, "world"]; let mixed: (string | number)[] = [1, "two", true];` }, { title: 'Object & Interface Errors', description: 'Working with object shapes and interfaces', code: `interface Person { name: string; age: number; email?: string; } let person: Person = { name: "John", years: 30, // Wrong property name phone: "123-456-7890" // Extra property }; let incomplete: Person = { name: "Jane" // Missing required 'age' property };` }, { title: 'Function Type Issues', description: 'Function parameters and return types', code: `function greet(name: string): string { return 42; // Wrong return type } function add(a: number, b: number): number { return a + b + "!"; // String concatenation instead of number } const multiply = (x: number, y: number): number => { console.log(x * y); // Missing return statement }; // Wrong argument types greet(123); add("5", "10");` }, { title: 'Generic Type Constraints', description: 'Understanding generics and constraints', code: `function getLength(arg: T): number { return arg.length; // T doesn't guarantee 'length' property } interface Lengthwise { length: number; } function getLength2(arg: T): number { return arg.width; // 'width' doesn't exist on Lengthwise } // Generic function calls getLength("hello"); getLength(42); // number doesn't have length` }, { title: 'Union & Literal Types', description: 'Working with union types and type guards', code: `type Status = "pending" | "complete" | "failed"; let currentStatus: Status = "running"; // Not in union function processId(id: string | number): string { return id.toUpperCase(); // Method might not exist on number } type Theme = "light" | "dark"; let userTheme: Theme = "blue"; // Not a valid literal` }, { title: 'Class & Inheritance Errors', description: 'Understanding class types and inheritance', code: `abstract class Animal { abstract makeSound(): string; move(): void { console.log("Moving..."); } } class Dog extends Animal { // Missing implementation of abstract method bark(): string { return "Woof!"; } } class Cat extends Animal { makeSound(): number { // Wrong return type return 42; } } let pet: Animal = new Animal(); // Can't instantiate abstract class` } ]; const errorExplanations: ErrorExplanation = { 2322: "🔄 Type Assignment Mismatch: You're trying to assign a value of one type to a variable expecting a different type. Check that your value matches the declared type.", 2339: "❌ Property Access Error: The property you're trying to access doesn't exist on this object type. Check the property name or the object's interface definition.", 2345: "⚠️ Function Argument Error: The argument you're passing doesn't match the function's expected parameter type. Verify the argument type matches the parameter.", 2314: "🔧 Generic Type Error: Generic types need type arguments specified. Either provide the type or let TypeScript infer it from usage.", 2353: "📝 Extra Object Property: You're adding properties that aren't defined in the interface. Remove extra properties or make them optional in the interface.", 2554: "🔢 Wrong Number of Arguments: The function call has too many or too few arguments. Check the function signature for required parameters.", 2304: "🔍 Undefined Name: The variable, function, or type you're referencing hasn't been declared. Make sure it's defined before use.", 2355: "↩️ Missing Return Value: A function with a non-void return type must return a value. Add a return statement or change the return type to void.", 2551: "🚫 Property Not Found: The property doesn't exist on this type. This often happens with union types - use type guards to narrow the type first.", 2367: "⚡ Unreachable Code: TypeScript detected that this condition will always be true or false, making some code unreachable.", 2515: "🏗️ Abstract Class Error: You can't create instances of abstract classes directly. Create a concrete subclass that implements all abstract members.", 2610: "📋 Missing Abstract Implementation: Abstract methods must be implemented in concrete subclasses. Add the missing method implementation.", 2416: "🔄 Override Type Mismatch: When overriding a method, the signature must be compatible with the parent class method.", 2741: "❓ Missing Required Property: Object literals must include all required properties. Add the missing property or make it optional in the interface.", 2571: "🎯 Union Type Error: This operation isn't valid for all types in the union. Use type guards or type assertions to narrow the type first." }; // Load TypeScript compiler useEffect(() => { const loadTypeScript = async (): Promise => { if (window.ts) { setTsLoaded(true); setIsLoading(false); return; } try { const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/4.9.5/typescript.min.js'; script.onload = () => { setTsLoaded(true); setIsLoading(false); }; script.onerror = () => { console.error('Failed to load TypeScript compiler'); setIsLoading(false); }; document.head.appendChild(script); } catch (error) { console.error('Error loading TypeScript:', error); setIsLoading(false); } }; loadTypeScript(); }, []); const checkTypes = useCallback((): void => { if (!tsLoaded || !window.ts || !code.trim()) { if (!code.trim()) { setErrors([]); } return; } try { const ts = window.ts; const compilerOptions: any = { noEmitOnError: true, noImplicitAny: true, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, strict: true, strictNullChecks: true, strictFunctionTypes: true, noImplicitReturns: true }; const sourceFile = ts.createSourceFile( 'temp.ts', code, ts.ScriptTarget.ES2020, true ); const host: any = { getSourceFile: (fileName: string) => fileName === 'temp.ts' ? sourceFile : undefined, writeFile: () => {}, getCurrentDirectory: () => '', getDirectories: () => [], fileExists: (fileName: string) => fileName === 'temp.ts', readFile: () => '', getCanonicalFileName: (fileName: string) => fileName, useCaseSensitiveFileNames: () => true, getNewLine: () => '\n', getDefaultLibFileName: () => 'lib.d.ts' }; const program = ts.createProgram(['temp.ts'], compilerOptions, host); const diagnostics = ts.getPreEmitDiagnostics(program); const formattedErrors: TypeScriptError[] = diagnostics.map((diagnostic: any) => { const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'); let line: number | undefined; let column: number | undefined; if (diagnostic.file && diagnostic.start !== undefined) { const lineChar = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start); line = lineChar.line + 1; column = lineChar.character + 1; } return { code: diagnostic.code, message, line, column, start: diagnostic.start, length: diagnostic.length }; }); setErrors(formattedErrors); } catch (error) { console.error('Type checking error:', error); setErrors([{ code: 0, message: `Parser Error: ${error instanceof Error ? error.message : 'Unknown error'}` }]); } }, [code, tsLoaded]); // Debounced type checking useEffect(() => { const timeoutId = setTimeout(() => { checkTypes(); }, 500); return () => clearTimeout(timeoutId); }, [checkTypes]); const handleExampleClick = (example: LearningExample): void => { setCode(example.code); }; const handleCodeChange = (event: React.ChangeEvent): void => { setCode(event.target.value); }; const handleKeyDown = (event: React.KeyboardEvent): void => { if (event.key === 'Tab') { event.preventDefault(); const target = event.target as HTMLTextAreaElement; const start = target.selectionStart; const end = target.selectionEnd; const newValue = target.value.substring(0, start) + ' ' + target.value.substring(end); setCode(newValue); // Set cursor position after the inserted spaces setTimeout(() => { target.selectionStart = target.selectionEnd = start + 2; }, 0); } }; return (
{/* Header */}
🔍 TypeScript Learning Debugger React + TypeScript
Write TypeScript code and learn from compiler errors. Each error includes detailed explanations to improve your type skills.

{isLoading ? (
Loading TypeScript compiler...
) : ( <> {/* Main Content */}
{/* Editor Panel */}
📝 Code Editor
              </div>

              {/* Output Panel */}
              <div className="flex flex-col border-l border-white/10">
                <div className="bg-black/20 px-6 py-3 border-b border-white/10">
                  <h2 className="text-white font-semibold text-sm">
                    🎯 Type Checker Output {errors.length > 0 && `(${errors.length} error${errors.length !== 1 ? 's' : ''})`}
                  </h2>
                </div>
                <div className="flex-1 p-6 bg-black/20 overflow-y-auto min-h-[400px]">
                  {!tsLoaded ? (
                    <div className="text-white/60">TypeScript compiler not loaded</div>
                  ) : errors.length === 0 ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 font-semibold">
                      ✅ No type errors found! Your TypeScript code is well-typed.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {errors.map((error, index) => (
                        <div key={index} className="space-y-3">
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <div className="text-red-400 font-semibold text-sm mb-2">
                              TS{error.code}
                            </div>
                            <div className="text-white mb-3 leading-relaxed">
                              {error.message}
                            </div>
                            {error.line && error.column && (
                              <div className="text-white/60 text-xs">
                                📍 Line {error.line}, Column {error.column}
                              </div>
                            )}
                          </div>
                          {errorExplanations[error.code] && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                              <div className="text-blue-400 font-semibold text-sm mb-2">
                                💡 Understanding this error:
                              </div>
                              <div className="text-white/90 text-sm leading-relaxed">
                                {errorExplanations[error.code]}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Examples Section */}
            <div className="bg-white/5 p-6 border-t border-white/10">
              <h3 className="text-white text-lg font-semibold mb-4">🎯 Learning Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {learningExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-left transition-all duration-300 hover:transform hover:-translate-y-1 group"
                  >
                    <div className="text-white font-medium text-sm mb-1 group-hover:text-blue-200">
                      {example.title}
                    </div>
                    {example.description && (
                      <div className="text-white/60 text-xs leading-relaxed">
                        {example.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TypeScriptDebugger;
