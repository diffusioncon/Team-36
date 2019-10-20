import Vue from 'vue'
import Web3 from 'web3'
import abi from '~/plugins/abi.json'

export const state = () => ({
  address: '',
  iRebellion: {},
  rebellion: {},
  rebel: {
    img: '',
    confCount: '0',
    budy1: '',
    budy2: ''
  }
})

export const mutations = {
  SET_ADDRESS(state, address) {
    state.address = address
  },

  SET_I(state, i) {
    Vue.set(state, 'iRebellion', i)
  },

  SET_CONTRACT(state, c) {
    Vue.set(state, 'rebellion', c)
  },

  SET_REBEL(state, data) {
    console.log(data)
    const imgA = hex2a(data.img.replace('0x', ''))
    state.rebel.img = 'https://i.imgur.com/'.imgA
    state.rebel.confCount = data.confCount
    state.rebel.budy1 = data.budy1.includes('0x00') ? '' : data.budy1
    state.rebel.budy2 = data.budy2.includes('0x00') ? '' : data.budy2
  }
}

let iRebellion = {}
let address = ''

export const actions = {
  async init({ commit, dispatch }) {
    const injectedProvider = window.ethereum
    const addresses = await injectedProvider.enable()
    const iWeb3 = new Web3(injectedProvider)
    address = addresses[0]

    iRebellion = new iWeb3.eth.Contract(
      abi,
      '0x0b6fce6075a9d4ad34e5565fedf7c495a2d82c1a'
    )

    commit('SET_ADDRESS', address)

    dispatch('getRebel')
  },

  async getRebel({ commit, state, dispatch }) {
    const rebel = await this.$rebellion.methods.rebels(address).call()

    commit('SET_REBEL', rebel)

    console.log(rebel)

    if (rebel.confCount === '0') {
      this.$router.push('/verify')
    }

    if (rebel.confCount === '1') {
      this.$router.push('/verify/awaiting')
    }

    if (rebel.confCount === '3') {
      this.$router.push('/dashboard')
    }
  },

  async register({ commit, state, dispatch }, img) {
    const hexImg = '0xafafafafaf'
    await iRebellion.methods.signup(hexImg).send({
      from: address
    })

    dispatch(this.getRebel)
  }
}

function hex2a(hexx) {
  const hex = hexx.toString() // force conversion
  let str = ''
  for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  return str
}

function getTransactionReceiptMined(txHash, interval) {
  const transactionReceiptRetry = () => this.getTransactionReceipt(txHash)
      .then(receipt => receipt != null
          ? receipt
          : Promise.delay(interval ? interval : 500).then(transactionReceiptRetry));
  if (Array.isArray(txHash)) {
      return sequentialPromise(txHash.map(
          oneTxHash => () => this.getTransactionReceiptMined(oneTxHash, interval)));
  } else if (typeof txHash === "string") {
      return transactionReceiptRetry();
  } else {
      throw new Error("Invalid Type: " + txHash);
  }
};