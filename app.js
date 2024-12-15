// Direcciones de los contratos (reemplaza con tus direcciones reales)
const tokenAAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const tokenBAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const simpleDEXAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// Variables globales para los contratos
let signer = null;
let simpleDEX = null;
let tokenA = null;
let tokenB = null;

// ABIs
const simpleDEXAbi = [
    "function addLiquidity(uint256 amountA, uint256 amountB) external",
    "function removeLiquidity(uint256 amountA, uint256 amountB) external",
    "function swapAforB(uint256 amountAIn) external",
    "function swapBforA(uint256 amountBIn) external",
    "function getPrice(address _token) external view returns (uint256)",
    "function owner() external view returns (address)",
    "function reserveA() external view returns (uint256)",
    "function reserveB() external view returns (uint256)",
    "function tokenA() external view returns (address)",
    "function tokenB() external view returns (address)"
];

const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)"
];

// Inicializar contratos
async function initializeContracts(provider) {
    try {
        signer = await provider.getSigner();
        console.log("Inicializando contratos...");
        
        simpleDEX = new ethers.Contract(simpleDEXAddress, simpleDEXAbi, signer);
        tokenA = new ethers.Contract(tokenAAddress, erc20Abi, signer);
        tokenB = new ethers.Contract(tokenBAddress, erc20Abi, signer);
        
        console.log("Contratos inicializados correctamente");
        console.log("SimpleDEX:", simpleDEX.target);
        console.log("TokenA:", tokenA.target);
        console.log("TokenB:", tokenB.target);
    } catch (error) {
        console.error("Error inicializando contratos:", error);
    }
}

// Manejar conexión de cuenta
async function handleAccountConnected(address) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await initializeContracts(provider);
    
    document.getElementById('walletInfo').textContent = `Conectado: ${address.substring(0,6)}...${address.substring(38)}`;
    document.getElementById('connectButton').textContent = 'Conectado';
    document.getElementById('connectButton').disabled = true;
}

// Conectar wallet
async function connectWallet() {
    if (!window.ethereum) {
        alert("Por favor instala MetaMask!");
        return;
    }
    
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await handleAccountConnected(accounts[0]);
    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Error al conectar wallet");
    }
}

// Añadir liquidez
async function addLiquidity() {
    if (!tokenA || !tokenB || !simpleDEX) {
        alert("Los contratos no están inicializados. Por favor conecta tu wallet primero.");
        return;
    }

    try {
        const amountA = document.getElementById('addLiquidityAmountA').value;
        const amountB = document.getElementById('addLiquidityAmountB').value;
        
        if (!amountA || !amountB) {
            alert("Por favor ingresa ambas cantidades");
            return;
        }

        const amountAWei = ethers.parseEther(amountA.toString());
        const amountBWei = ethers.parseEther(amountB.toString());

        console.log("Aprobando TokenA...");
        const approvalA = await tokenA.approve(simpleDEXAddress, amountAWei);
        await approvalA.wait();
        console.log("TokenA aprobado");
        
        console.log("Aprobando TokenB...");
        const approvalB = await tokenB.approve(simpleDEXAddress, amountBWei);
        await approvalB.wait();
        console.log("TokenB aprobado");
        
        console.log("Añadiendo liquidez...");
        const tx = await simpleDEX.addLiquidity(amountAWei, amountBWei);
        await tx.wait();
        
        alert("Liquidez añadida exitosamente!");
    } catch (error) {
        console.error("Error detallado:", error);
        alert("Error al añadir liquidez: " + error.message);
    }
}

// Retirar liquidez
async function removeLiquidity() {
    if (!tokenA || !tokenB || !simpleDEX) {
        alert("Los contratos no están inicializados. Por favor conecta tu wallet primero.");
        return;
    }

    try {
        const amountA = document.getElementById('removeLiquidityAmountA').value;
        const amountB = document.getElementById('removeLiquidityAmountB').value;
        
        if (!amountA || !amountB) {
            alert("Por favor ingresa ambas cantidades");
            return;
        }

        const amountAWei = ethers.parseEther(amountA.toString());
        const amountBWei = ethers.parseEther(amountB.toString());
        
        console.log("Retirando liquidez...");
        const tx = await simpleDEX.removeLiquidity(amountAWei, amountBWei);
        await tx.wait();
        
        alert("Liquidez retirada exitosamente!");
    } catch (error) {
        console.error("Error detallado:", error);
        alert("Error al retirar liquidez: " + error.message);
    }
}

// Swap A por B
async function swapAforB() {
    if (!tokenA || !tokenB || !simpleDEX) {
        alert("Los contratos no están inicializados. Por favor conecta tu wallet primero.");
        return;
    }

    try {
        const amount = document.getElementById('swapAmount').value;
        if (!amount) {
            alert("Por favor ingresa una cantidad");
            return;
        }

        const amountWei = ethers.parseEther(amount.toString());
        
        console.log("Aprobando TokenA...");
        const approval = await tokenA.approve(simpleDEXAddress, amountWei);
        await approval.wait();
        
        console.log("Ejecutando swap...");
        const tx = await simpleDEX.swapAforB(amountWei);
        await tx.wait();
        
        alert("Swap completado exitosamente!");
    } catch (error) {
        console.error("Error detallado:", error);
        alert("Error en el swap: " + error.message);
    }
}

// Swap B por A
async function swapBforA() {
    if (!tokenA || !tokenB || !simpleDEX) {
        alert("Los contratos no están inicializados. Por favor conecta tu wallet primero.");
        return;
    }

    try {
        const amount = document.getElementById('swapAmount').value;
        if (!amount) {
            alert("Por favor ingresa una cantidad");
            return;
        }

        const amountWei = ethers.parseEther(amount.toString());
        
        console.log("Aprobando TokenB...");
        const approval = await tokenB.approve(simpleDEXAddress, amountWei);
        await approval.wait();
        
        console.log("Ejecutando swap...");
        const tx = await simpleDEX.swapBforA(amountWei);
        await tx.wait();
        
        alert("Swap completado exitosamente!");
    } catch (error) {
        console.error("Error detallado:", error);
        alert("Error en el swap: " + error.message);
    }
}

// Obtener precio
async function getPrice(token) {
    if (!simpleDEX) {
        alert("Los contratos no están inicializados. Por favor conecta tu wallet primero.");
        return;
    }

    try {
        const price = await simpleDEX.getPrice(token);
        const formattedPrice = ethers.formatEther(price);
        document.getElementById('priceInfo').textContent = 
            `Precio: ${formattedPrice} ${token === tokenAAddress ? 'Token B por Token A' : 'Token A por Token B'}`;
    } catch (error) {
        console.error("Error detallado:", error);
        alert("Error al obtener el precio: " + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await handleAccountConnected(accounts[0]);
            }
        } catch (error) {
            console.error(error);
        }
    }
});

if (window.ethereum) {
    window.ethereum.on('accountsChanged', async function(accounts) {
        if (accounts.length > 0) {
            await handleAccountConnected(accounts[0]);
        } else {
            document.getElementById('walletInfo').textContent = 'Not connected';
            document.getElementById('connectButton').textContent = 'Connect Wallet';
            document.getElementById('connectButton').disabled = false;
        }
    });
}

// Asignar event listeners a los botones
document.getElementById('connectButton').onclick = connectWallet;
document.getElementById('addLiquidityButton').onclick = addLiquidity;
document.getElementById('removeLiquidityButton').onclick = removeLiquidity;
document.getElementById('swapAforBButton').onclick = swapAforB;
document.getElementById('swapBforAButton').onclick = swapBforA;
document.getElementById('getPriceAButton').onclick = () => getPrice(tokenAAddress);
document.getElementById('getPriceBButton').onclick = () => getPrice(tokenBAddress);