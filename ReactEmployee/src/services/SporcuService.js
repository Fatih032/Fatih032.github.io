import axios from 'axios';

const Sporcu_API_URL = 'http://localhost:8080/sporcu/all';

class SporcuService {
    
    getAllSporcu() {
        return axios.get(Sporcu_API_URL);
    }

    createSporcu(Sporcu) {
        return axios.post(Sporcu_API_URL, Sporcu)
    }

    getSporcuById(SporcuId) {
        return axios.get(Sporcu_API_URL + '/' + SporcuId);
    }

    updateSporcu(SporcuId, Sporcu) {
        return axios.put(Sporcu_API_URL + '/' + SporcuId, Sporcu);
    }

    deleteSporcu(SporcuId) {
        return axios.delete(Sporcu_API_URL + '/' + SporcuId);
    }
}


export default new SporcuService();