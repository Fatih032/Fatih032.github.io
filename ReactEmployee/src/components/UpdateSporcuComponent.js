import React, { Component } from 'react'
import SporcuService from '../services/SporcuService';
import {withRouter} from '../services/withRouter';

class UpdateSporcuComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: this.props.params.id,
            name: '',
            surname: '',
/*             email: '', */
            kulüp: '',
            sıno: '',
            dogumtarihi: ''
        }
        this.changeFirstNameHandler = this.changeFirstNameHandler.bind(this);
        this.changeLastNameHandler = this.changeLastNameHandler.bind(this);
        this.changeKulüpHandler = this.changeKulüpHandler.bind(this);
        this.changeSInoHandler = this.changeSInoHandler.bind(this);
        this.changeDogumtarihiHandler = this.changeDogumtarihiHandler.bind(this);
        this.updateSporcu = this.updateSporcu.bind(this);
        this.cancel = this.cancel.bind(this);
    }
      
    updateSporcu = (e) => {
        e.preventDefault();
        let sporcu= {name: this.state.name, surname: this.state.surname, kulüp: this.state.kulüp, sıno: this.state.sıno, dogumtarihi: this.state.dogumtarihi};
        console.log('sporcu => ' + JSON.stringify(sporcu)); 
        SporcuService.updateSporcu(this.state.id, sporcu).then(res => {
          this.props.navigate('/sporcu');
        });     
    }

    cancel = () => {
        this.props.navigate('/');
      }

    componentDidMount() {
        SporcuService.getSporcuById(this.state.id).then((res) => {
            let sporcu = res.data;
            this.setState({
                name: sporcu.name,
                surname: sporcu.surname,
/*                 email: sporcu.email, */
                kulüp: sporcu.kulüp,
                sıno: sporcu.sıno,
                dogumtarihi: sporcu.dogumtarihi
            });
        });
    }




    changeFirstNameHandler = (event) => {
        this.setState({ name: event.target.value })
    }

    changeLastNameHandler = (event) => {
        this.setState({ surname: event.target.value })
    }

/*     changeEmailHandler = (event) => {
        this.setState({ email: event.target.value })
    } */

    changeKulüpHandler = (event) => {
        this.setState({ kulüp: event.target.value })
    }

    changeSInoHandler = (event) => {
        this.setState({ sıno: event.target.value })
    }

    changeDogumtarihiHandler = (event) => {
        this.setState({ dogumtarihi: event.target.value })
    }




render() {
  return (
      <div>
        <br/> <br/>
          <div className='container'>
            <div className='row'>
              <div className='card col-md-6 offset-md-3 offset-md-3'>
                <h3 className='text-center'>Sporcu Güncelle</h3>
                <div className='card-body'>
                  <form>
                    <div className='form-group mb-2'>
                      <label className='form-label'>İsim</label>
                      <input type='text' placeholder='Enter first name ' className='form-control' value={this.state.name} onChange={this.changeFirstNameHandler} />
                      </div>
                      <div className='form-group mb-2'>
                      <label className='form-label'>Soyisim</label>
                      <input type='text' placeholder='Enter last name ' className='form-control' value={this.state.surname} onChange={this.changeLastNameHandler} />
                      </div>
{/*                       <div className='form-group mb-2'>
                      <label className='form-label'>Email</label>
                      <input type='text' placeholder='Enter email' className='form-control' value={this.state.email} onChange={this.changeEmailHandler} />
                      </div> */}
                      <div className='form-group mb-2'>
                      <label className='form-label'>Kulüp</label>
                      <input type='text' placeholder='Enter kulüp' className='form-control' value={this.state.kulüp} onChange={this.changeKulüpHandler} />
                      </div>
                      <div className='form-group mb-2'>
                      <label className='form-label'>SI No</label>
                      <input type='text' placeholder="SI'yınızı giriniz" className='form-control' value={this.state.sıno} onChange={this.changeSInoHandler} />
                      </div>
                      <div className='form-group mb-2'>
                      <label className='form-label'>Doğum Yılı</label>
                      <input type='text' placeholder='Doğum yılınızı giriniz' className='form-control' value={this.state.dogumtarihi} onChange={this.changeDogumtarihiHandler} />
                      </div>

                      <button onClick={this.updateSporcu} className='btn btn-success'>Güncelle</button>
                      <button onClick={this.cancel} className='btn btn-danger' style={{marginLeft: "10px"}}>Cancel</button>
                  </form>
                </div>
              </div>
            </div> 
          </div>
        </div>
    )
  }
}

export default withRouter(UpdateSporcuComponent);