import React, { useEffect, useState } from 'react'
import { get, findLast, last } from 'lodash'
import qs from 'querystring'
import './Home.scss'
import api from '../../services/api'

const Home = () => {
    const[normalPasswordsQueue, setNormalPasswordsQueue] = useState([''])
    const[preferencialPasswordsQueue, setPreferencialPasswordsQueue] = useState([''])
    const[lastCalledPassword, setLastCalledPassword] = useState('')
    const[lastCreatedPassword, setLastCreatedPassword] = useState('')
    const[manager, setManager] = useState(localStorage.getItem('manager'))

    useEffect(() => {
        api.get('get-passwords').then(res => {
            let lastPassCalled = last(get(res,'data.usedPasswords',''))
            let lastPassCreated = findLast(get(res,'data.allPasswords',''), (values) => values.enabled === true)
            setLastCalledPassword(get(lastPassCalled, 'password', ''))
            setLastCreatedPassword(get(lastPassCreated, 'password'))
            setNormalPasswordsQueue(get(res, 'data.normalPasswords', ''))
            setPreferencialPasswordsQueue(get(res, 'data.preferencialPasswords', ''))
        })
    }, [])

    const addPassword = (e) => {
        let type = { type: e.target.value }
        type = qs.stringify(type)
        const headers = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        api.post('create-password', type, headers).then(res => {
            setLastCreatedPassword(get(res, 'data.password',''))
            get(res, 'data.type', '') === 'N' ? 
            setNormalPasswordsQueue([...normalPasswordsQueue, get(res, 'data')]) : setPreferencialPasswordsQueue([...preferencialPasswordsQueue, get(res, 'data')])
        })
    }

    const callPassword = () => {
        let params = { manager: manager }
        params = qs.stringify(params)
        const headers = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        api.post('call-next-password', params, headers).then(res => {
            setLastCalledPassword(get(res, 'data'))
            api.get('get-passwords').then(res => {
                let lastPassCreated = findLast(get(res,'data.allPasswords',''), (values) => values.enabled === true)
                setNormalPasswordsQueue(get(res, 'data.normalPasswords', ''))
                setLastCreatedPassword(get(lastPassCreated, 'password'))
                setPreferencialPasswordsQueue(get(res, 'data.preferencialPasswords', ''))
            })
        }).catch(res => {})
    }

    const resetPasswords = () => {
        let params = { manager }
        params = qs.stringify(params)
        const headers = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        api.post('reset-passwords', params, headers).then(res => {
            setNormalPasswordsQueue([''])
            setPreferencialPasswordsQueue([''])
            setLastCalledPassword('')
            setLastCreatedPassword('')
        })
    }

    const enterManager = () => {
        localStorage.setItem('manager', true)
        setManager(localStorage.getItem('manager'))
    }

    const quitManager = () => {
        localStorage.setItem('manager', false)
        setManager(localStorage.getItem('manager'))
    }

    return(
        <div className="home-container">
            <div className="row justify-content-end header">
                <div className="col-1">
                    {manager==='true' ? 
                        <button type="button" className="btn btn-primary manager-button" onClick={() => quitManager()}>Cliente</button>
                    :
                        <button type="button" className="btn btn-primary manager-button" onClick={() => enterManager()}>Gerenciar</button>
                    }
                </div>
            </div>
            <div className="container">
                <div className="row justify-content-center">
                <div className="col-10 passwords">
                    <div className="row justify-content-end">
                        <div className="col-3">
                            <button type="button" className="btn btn-primary" value="N" onClick={(e) => addPassword(e)}>Senha Normal</button>
                        </div>
                        <div className="col-3">
                            <button type="button" className="btn btn-primary" value="P" onClick={(e) => addPassword(e)}>Senha Preferencial</button>
                        </div>
                    </div>
                    <div className="card">
                        <div className="row">
                            <div className="col-4 smaller-screen">
                                <br/>
                                <h5>Fila de Senhas Normais</h5>
                                <span>{get(normalPasswordsQueue, '[0].password', '')} </span> 
                                <span>{get(normalPasswordsQueue, '[1].password', '')} </span> 
                                <span>{get(normalPasswordsQueue, '[2].password', '')} </span> 
                                <span>{get(normalPasswordsQueue, '[3].password', '')} </span> 
                                <span>{get(normalPasswordsQueue, '[4].password', '')} </span>
                                <br/>
                                <br/>
                                <h5>Fila de Senhas Preferenciais</h5>
                                <span>{get(preferencialPasswordsQueue, '[0].password', '')} </span> 
                                <span>{get(preferencialPasswordsQueue, '[1].password', '')} </span> 
                                <span>{get(preferencialPasswordsQueue, '[2].password', '')} </span> 
                                <span>{get(preferencialPasswordsQueue, '[3].password', '')} </span> 
                                <span>{get(preferencialPasswordsQueue, '[4].password', '')} </span>
                            </div>
                            <div className="col-8 big-screen">
                                <h1>Senha Chamada</h1>
                                <span className="big-screen">{lastCalledPassword}</span>
                                <br/>
                                <br/>
                                <h2>Última Senha Criada</h2>
                                <span className="big-screen">{lastCreatedPassword}</span>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                {manager==='true' ? 
                    <div className="row justify-content-md-center">
                        <div className="col-6">
                            <button type="button" className="btn btn-primary" onClick={() => callPassword()}>Chamar Senha</button>
                            <button type="button" className="btn btn-primary" onClick={() => resetPasswords()}>Resetar Senhas</button>
                        </div>
                    </div>
                    :
                    ''
                }
            </div>
        </div>
    )
}

export default Home