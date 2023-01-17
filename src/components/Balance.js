import rtbm from '../assets/dapp.svg'
import rEth from '../assets/eth.svg'
import { useEffect , useState , useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadBalances, transferTokens } from '../store/interactions';
//import { exchange, tokens } from '../store/reducers';

const Balance = () => {
    //Change Submit button text based on selected Tab
    const [isDeposit , setIsDeposit] = useState(true);
    
    //Hooks used
    const [token1TransferAmount ,setToken1TransferAmount] = useState(0);
    const [token2TransferAmount ,setToken2TransferAmount] = useState(0);
    

    const dispatch = useDispatch();
    
    const provider = useSelector(state => state.provider.connection);    
    const account = useSelector(state => state.provider.account);

    const exchange = useSelector(state => state.exchange.contract);
    const exchangeBalances = useSelector(state => state.exchange.balances);
    const transferInProgress = useSelector(state => state.exchange.transferInProgress);
    const tokens = useSelector(state => state.tokens.contracts);
    const symbols = useSelector(state => state.tokens.symbols);
    const tokenBalances = useSelector(state => state.tokens.balances);
    
    //useRef used to handle Deposit and Withdrawal tab events
    const depositRef = useRef(null);
    const withdrawRef = useRef(null);

    

    // Switch between Deposit and Withdrawal
    const tabHandler = (event) => {
      if(event.target.className !== depositRef.current.className){
        event.target.className = 'tab tab--active';
        depositRef.current.className ='tab';
        setIsDeposit (false);
      }
      else {
        event.target.className = 'tab tab--active';
        withdrawRef.current.className ='tab';
        setIsDeposit (true)
      }
      
    }
    //Update Balance Amount handler from textbox
    const amountHandler = (event ,token) =>{
        if(token.address === tokens[0].address){
          setToken1TransferAmount(event.target.value);
        }
        else {
          setToken2TransferAmount(event.target.value);
        }
    }

    // 1 - Make Transfer => depositHandler event
    // 2 - Notify App that Transfer are pending => check TRANSFER_REQUEST in reducer
    // 3 - Get confirmation from blockchain that Transfer was success => check TRANSFER_SUCCESS in reducer
    // 4 - Notify App that Transfer is success => check subscribeToEvents in interactions
    // 5 - Handler FAILED Transfer and NOTIFY App => check TRANSFER_FAIL in reducer
    
    // 1 - Make Transfer
    const depositHandler = (event ,token) =>{
        event.preventDefault(); // Prevents default refresh on enter
        if(token.address === tokens[0].address){
          //Transfer tokens to meta
          transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch);
          // clear text box
          setToken1TransferAmount(0);
        }
        else {
          transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch);
          // clear text box
          setToken2TransferAmount(0); 
        }
    }

    //Withdrawal Handler
    const withdrawHandler = (event ,token) =>{
      event.preventDefault(); // Prevents default refresh on enter
      if(token.address === tokens[0].address){
        //Withdraw tokens to meta
        transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch);
        // clear text box
        setToken1TransferAmount(0);
      }
      else {
        transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch);
        // clear text box
        setToken2TransferAmount(0); 
      }
  }
    
    useEffect(() => {
        if(exchange && tokens[0] && tokens[1] && account) {
          loadBalances(exchange, tokens, account, dispatch)
        }
      }, [exchange, tokens, account, transferInProgress])

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button onClick={tabHandler} ref = {depositRef} className='tab'>Deposit</button>
            <button onClick={tabHandler} ref = {withdrawRef} className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (rtbm) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small> <br/> <img src={rtbm} alt="Token Logo" /> {symbols && symbols[0]}</p>     
            <p><small>Wallet</small> <br />{tokenBalances && tokenBalances[0]}</p>  
            <p><small>Exchange</small> <br />{exchangeBalances && exchangeBalances[0]}</p>  
                 
          </div>
  
          <form onSubmit= 
            { isDeposit ? (event) => depositHandler(event , tokens[0]) :
            (event) => withdrawHandler (event, tokens[0])}
          >
            <label htmlFor="token0">{symbols && symbols[0]} Amount </label>
            <input 
                type="text" 
                id='token0' 
                placeholder='0.0000' 
                //Clear input Field
                value={token1TransferAmount === 0 ? '' : token1TransferAmount} 
                onChange={(event) => amountHandler(event, tokens[0])} />
  
            <button className='button' type='submit'>
              
              {/* Set submit button text based on tab selected */}
              { isDeposit ? (<span>Deposit</span>) : <span>Withdraw</span>}

            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (rEth) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small> <br/> <img src={rEth} alt="Token Logo" /> {symbols && symbols[1]}</p>     
            <p><small>Wallet</small> <br />{tokenBalances && tokenBalances[1]}</p>  
            <p><small>Exchange</small> <br />{exchangeBalances && exchangeBalances[1]}</p> 
          </div>
  
          <form onSubmit= 
            { isDeposit ? (event) => depositHandler(event , tokens[1]) :
            (event) => withdrawHandler (event, tokens[1])}
          >
            <label htmlFor="token1"></label>
            <input type="text" 
            id='token1' 
            placeholder='0.0000'
            //Clear input Field
            value={token2TransferAmount === 0 ? '' : token2TransferAmount} 
            onChange={(event) => amountHandler(event, tokens[1])}  
            />
  
            <button className='button' type='submit'>
               {/* Set submit button text based on tab selected */}
               { isDeposit ? (<span>Deposit</span>) : <span>Withdraw</span>}

            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;