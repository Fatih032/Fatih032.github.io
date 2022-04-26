import React, { Component } from 'react'
import SporcuService from '../services/SporcuService';
import {withRouter} from '../services/withRouter';

class ListSporcuComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            Sporcu: []
        }
        this.addSporcu = this.addSporcu.bind(this);
        this.updateSporcu = this.updateSporcu.bind(this);
        this.dltSporcu = this.dltSporcu.bind(this);
    }

    componentDidMount() {
        SporcuService.getAllSporcu().then((res) => {
            this.setState({ Sporcu: res.data })
        })
    }

    viewSporcu(id) {
        this.props.navigate(`/sporcu-guruntule/${id}`);
    }

    dltSporcu(id) {
        SporcuService.deleteSporcu(id).then((res) => {
            this.setState({Sporcu: this.state.Sporcu.filter(Sporcu => Sporcu.id !== id)});
        });
    }

    addSporcu = (e) => {
        e.preventDefault();
        this.props.navigate('/sporcu-kayit');
    }

    updateSporcu(id) {
        this.props.navigate(`/sporcu-guncelle/${id}`);
    }

  render() {
    return (
        <div>
          <h2 className="text-center">Sporcu Listesi</h2>
          <button onClick={this.addSporcu} className="btn btn-info">Sporcu Ekle</button>
          <div className="row">
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>İsim</th>
                        <th>Soyisim</th>
                        <th>Kulüp</th>
                        <th>SI No</th>
                        <th>Doğum Yılı</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.Sporcu.map(
                            Sporcu =>
                                <tr key={Sporcu.id}>
                                    <td>{Sporcu.name}</td>
                                    <td>{Sporcu.surname}</td>
{/*                                     <td>{Sporcu.email}</td> */}
                                    <td>{Sporcu.kulüp}</td>
                                    <td>{Sporcu.sıno}</td>
                                    <td>{Sporcu.dogumtarihi}</td>
                                    <td>
                                        <button onClick = { () => {this.updateSporcu(Sporcu.id)}} className="btn btn-info">Güncelle</button>
                                        <button style={{marginLeft:"10px"}} onClick = { () => {this.dltSporcu(Sporcu.id)}} className="btn btn-danger">Sil</button>
                                        <button style={{marginLeft:"10px"}} onClick = { () => {this.viewSporcu(Sporcu.id)}} className="btn btn-info">Görüntüle</button>
                                    </td>
                                </tr>
                        )
                    }
                </tbody>
            </table>
            </div>
        </div>

    )
  }
}

export default withRouter(ListSporcuComponent);