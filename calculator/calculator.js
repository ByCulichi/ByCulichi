// iOS Calculator - Enhanced with IMAC Features
class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.historyModal = document.getElementById('historyModal');
        this.historyBtn = document.getElementById('historyBtn');
        this.closeHistoryBtn = document.getElementById('closeHistory');
        this.editHistoryBtn = document.getElementById('editHistory');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.recent7DaysContainer = document.getElementById('recent7Days');
        this.recent30DaysContainer = document.getElementById('recent30Days');
        
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.waitingForNewNumber = true;
        this.history = this.loadHistory();
        this.editMode = false;
        
        this.init();
        this.setupEventListeners();
        this.loadHistoryDisplay();
        this.handleSplashScreen();
    }

    init() {
        this.updateDisplay();
    }

    handleSplashScreen() {
        const splashScreen = document.getElementById('splashScreen');
        
        // Auto-dismiss after 2 seconds
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 300);
        }, 2000);

        // Dismiss on tap
        splashScreen.addEventListener('click', () => {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 300);
        });
    }

    setupEventListeners() {
        // Number and operator buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
                this.addPressAnimation(e.target);
            });
        });

        // History modal controls
        this.historyBtn.addEventListener('click', () => {
            this.showHistoryModal();
        });

        this.closeHistoryBtn.addEventListener('click', () => {
            this.hideHistoryModal();
        });

        this.editHistoryBtn.addEventListener('click', () => {
            this.toggleEditMode();
        });

        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistoryWithConfirmation();
        });

        // Close modal when clicking outside
        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) {
                this.hideHistoryModal();
            }
        });

        // Icon button functionality
        document.getElementById('iconBtn').addEventListener('click', () => {
            this.showAbout();
        });
    }

    addPressAnimation(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }

    handleButtonClick(button) {
        const number = button.getAttribute('data-number');
        const action = button.getAttribute('data-action');

        if (number !== null) {
            this.inputNumber(number);
        } else if (action) {
            this.handleAction(action);
        }
    }

    inputNumber(number) {
        if (number === '.' && this.currentInput.includes('.')) {
            return; // Prevent multiple decimal points
        }

        if (this.waitingForNewNumber || this.currentInput === '0') {
            if (number === '.') {
                this.currentInput = '0.';
            } else {
                this.currentInput = number;
            }
            this.waitingForNewNumber = false;
        } else {
            this.currentInput += number;
        }

        this.updateDisplay();
    }

    handleAction(action) {
        const current = parseFloat(this.currentInput);

        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'sign':
                this.toggleSign();
                break;
            case 'percent':
                this.applyPercent();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.setOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.waitingForNewNumber = true;
        this.updateDisplay();
    }

    toggleSign() {
        if (this.currentInput !== '0') {
            if (this.currentInput.startsWith('(') && this.currentInput.endsWith(')')) {
                // Remove parentheses
                this.currentInput = this.currentInput.slice(2, -1);
            } else if (this.currentInput.startsWith('-')) {
                // Remove negative sign and add parentheses
                this.currentInput = `(-${this.currentInput.slice(1)})`;
            } else {
                // Add parentheses for negative
                this.currentInput = `(-${this.currentInput})`;
            }
            this.updateDisplay();
        }
    }

    applyPercent() {
        const current = parseFloat(this.currentInput.replace(/[()]/g, ''));
        const result = current / 100;
        this.currentInput = result.toString();
        this.updateDisplay();
    }

    setOperator(newOperator) {
        const current = parseFloat(this.currentInput.replace(/[()]/g, ''));

        if (this.previousInput === null) {
            this.previousInput = current;
        } else if (this.operator) {
            const result = this.performCalculation();
            this.currentInput = result.toString();
            this.previousInput = result;
            this.updateDisplay();
        }

        this.waitingForNewNumber = true;
        this.operator = newOperator;
    }

    calculate() {
        if (this.operator && this.previousInput !== null && !this.waitingForNewNumber) {
            const result = this.performCalculation();
            const calculation = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${this.currentInput.replace(/[()]/g, '')} = ${result}`;
            
            // Add to history
            this.addToHistory(calculation);
            
            this.currentInput = result.toString();
            this.previousInput = null;
            this.operator = null;
            this.waitingForNewNumber = true;
            this.updateDisplay();
            this.saveHistory();
        }
    }

    performCalculation() {
        const previous = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput.replace(/[()]/g, ''));

        switch (this.operator) {
            case 'add':
                return previous + current;
            case 'subtract':
                return previous - current;
            case 'multiply':
                return previous * current;
            case 'divide':
                return current !== 0 ? previous / current : 0;
            default:
                return current;
        }
    }

    getOperatorSymbol(operator) {
        switch (operator) {
            case 'add': return '+';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }

    updateDisplay() {
        // Handle large numbers with scientific notation
        let displayValue = this.currentInput;
        if (!isNaN(displayValue) && !displayValue.includes('(')) {
            const num = parseFloat(displayValue);
            if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
                displayValue = num.toExponential(6);
            } else {
                displayValue = num.toLocaleString('en-US', {
                    maximumFractionDigits: 8
                });
            }
        }
        
        this.display.textContent = displayValue;
        
        // Adjust font size for long numbers
        const length = displayValue.length;
        if (length > 9) {
            this.display.style.fontSize = '36pt';
        } else if (length > 6) {
            this.display.style.fontSize = '42pt';
        } else {
            this.display.style.fontSize = '48pt';
        }
    }

    // History Management
    addToHistory(calculation) {
        const historyItem = {
            calculation: calculation,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only the last 100 items
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        
        this.loadHistoryDisplay();
    }

    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistoryDisplay() {
        this.recent7DaysContainer.innerHTML = '';
        this.recent30DaysContainer.innerHTML = '';

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let recent7Days = [];
        let recent30Days = [];

        this.history.forEach((item, index) => {
            const itemDate = new Date(item.timestamp);
            const historyElement = this.createHistoryElement(item, index);
            
            if (itemDate >= sevenDaysAgo) {
                recent7Days.push(historyElement);
            } else if (itemDate >= thirtyDaysAgo) {
                recent30Days.push(historyElement);
            }
        });

        // Add sample calculations if history is empty
        if (this.history.length === 0) {
            this.addSampleHistory();
            return;
        }

        // Display recent calculations
        if (recent7Days.length === 0) {
            this.recent7DaysContainer.innerHTML = '<p style="color: #8E8E93; font-size: 14px; text-align: center; padding: 20px;">No hay cálculos recientes</p>';
        } else {
            recent7Days.forEach(element => {
                this.recent7DaysContainer.appendChild(element);
            });
        }

        if (recent30Days.length === 0) {
            this.recent30DaysContainer.innerHTML = '<p style="color: #8E8E93; font-size: 14px; text-align: center; padding: 20px;">No hay cálculos antiguos</p>';
        } else {
            recent30Days.forEach(element => {
                this.recent30DaysContainer.appendChild(element);
            });
        }
    }

    addSampleHistory() {
        const sampleCalculations = [
            '160 ÷ 6 = 26.666666',
            '2.3643 × 15 = 35.4645',
            '125 + 37 = 162',
            '89 − 23 = 66',
            '15 × 8 = 120'
        ];

        sampleCalculations.forEach((calc, index) => {
            const timestamp = new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000);
            this.history.push({
                calculation: calc,
                timestamp: timestamp.toISOString()
            });
        });

        this.saveHistory();
        this.loadHistoryDisplay();
    }

    createHistoryElement(item, index) {
        const element = document.createElement('div');
        element.className = 'history-item';
        element.textContent = item.calculation;
        element.setAttribute('data-index', index);
        
        element.addEventListener('click', () => {
            if (this.editMode) {
                this.selectHistoryItem(element);
            } else {
                this.loadCalculationFromHistory(item.calculation);
                this.hideHistoryModal();
            }
        });

        return element;
    }

    loadCalculationFromHistory(calculation) {
        // Extract the result from the calculation
        const parts = calculation.split(' = ');
        if (parts.length === 2) {
            this.currentInput = parts[1];
            this.previousInput = null;
            this.operator = null;
            this.waitingForNewNumber = true;
            this.updateDisplay();
        }
    }

    showHistoryModal() {
        this.historyModal.classList.add('show');
        this.loadHistoryDisplay();
    }

    hideHistoryModal() {
        this.historyModal.classList.remove('show');
        this.editMode = false;
        this.editHistoryBtn.textContent = 'Editar';
        this.updateHistoryItemStyles();
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        this.editHistoryBtn.textContent = this.editMode ? 'Cancelar' : 'Editar';
        this.updateHistoryItemStyles();
    }

    updateHistoryItemStyles() {
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            if (this.editMode) {
                item.style.position = 'relative';
                item.style.paddingLeft = '40px';
                if (!item.querySelector('.checkbox')) {
                    const checkbox = document.createElement('div');
                    checkbox.className = 'checkbox';
                    checkbox.style.cssText = `
                        position: absolute;
                        left: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                        border: 2px solid #8E8E93;
                        border-radius: 4px;
                        background: transparent;
                        cursor: pointer;
                    `;
                    item.appendChild(checkbox);
                }
            } else {
                item.style.paddingLeft = '16px';
                const checkbox = item.querySelector('.checkbox');
                if (checkbox) {
                    checkbox.remove();
                }
            }
        });
    }

    selectHistoryItem(element) {
        const checkbox = element.querySelector('.checkbox');
        if (checkbox) {
            const isSelected = checkbox.style.background === 'rgb(255, 149, 0)';
            checkbox.style.background = isSelected ? 'transparent' : '#FF9500';
            checkbox.innerHTML = isSelected ? '' : '✓';
        }
    }

    clearHistoryWithConfirmation() {
        if (this.editMode) {
            const selected = document.querySelectorAll('.history-item .checkbox').length;
            const confirmed = confirm(`¿Estás seguro de que deseas eliminar los elementos seleccionados del historial?`);
            
            if (confirmed) {
                this.clearSelectedHistory();
            }
        } else {
            const confirmed = confirm('¿Estás seguro de que deseas borrar todo el historial?');
            
            if (confirmed) {
                this.history = [];
                this.saveHistory();
                this.loadHistoryDisplay();
            }
        }
    }

    clearSelectedHistory() {
        const selectedItems = [];
        document.querySelectorAll('.history-item').forEach((item, index) => {
            const checkbox = item.querySelector('.checkbox');
            if (checkbox && checkbox.style.background === 'rgb(255, 149, 0)') {
                selectedItems.push(parseInt(item.getAttribute('data-index')));
            }
        });

        // Remove selected items (sort in descending order to avoid index issues)
        selectedItems.sort((a, b) => b - a).forEach(index => {
            this.history.splice(index, 1);
        });

        this.saveHistory();
        this.loadHistoryDisplay();
        this.toggleEditMode(); // Exit edit mode
    }

    showAbout() {
        alert('Calculator Culichi\n\nDesarrollado por Christian Velasco\ncon tecnologías web modernas.\n\n¡Gracias por usar nuestra calculadora!');
    }
}

// Initialize calculator when DOM is loaded
let calculatorInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    calculatorInstance = new Calculator();
    window.calculator = calculatorInstance;
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (!calculatorInstance) return;

    const key = e.key;
    
    // Prevent default for calculator keys
    if (/[0-9+\-*\/=.]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        e.preventDefault();
    }

    // Number keys
    if (/[0-9.]/.test(key)) {
        calculatorInstance.inputNumber(key);
    }
    
    // Operator keys
    switch (key) {
        case '+':
            calculatorInstance.handleAction('add');
            break;
        case '-':
            calculatorInstance.handleAction('subtract');
            break;
        case '*':
            calculatorInstance.handleAction('multiply');
            break;
        case '/':
            calculatorInstance.handleAction('divide');
            break;
        case 'Enter':
        case '=':
            calculatorInstance.handleAction('equals');
            break;
        case 'Escape':
        case 'c':
        case 'C':
            calculatorInstance.handleAction('clear');
            break;
        case 'Backspace':
            calculatorInstance.handleAction('clear');
            break;
        case '%':
            calculatorInstance.handleAction('percent');
            break;
    }
});