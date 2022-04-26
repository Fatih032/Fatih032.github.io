import React, { Component } from 'react'
import SporcuService from '../services/SporcuService';
import {withRouter} from '../services/withRouter';

class ViewSporcuComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
          id: this.props.params.id,
          sporcu: {}

        }
    }

    componentDidMount() {
        SporcuService.getSporcuById(this.state.id).then((res) => {
            this.setState({ sporcu: res.data })
        })
    }


  render() {
    return (
      <div>
          <div className="card col-md-6 offset-md-3">
            <h3> Sporcu Bilgileri</h3>
            <div className="card-body">
              <div className="row">
                <div >
                <label >Sporcu İsmi: </label>
                  {this.state.sporcu.name}
                </div>
                <div >
                <label >Sporcu Soyismi: </label>
                  {this.state.sporcu.surname}
                </div>
                <div >
                <label >Sporcu Doğum Tarihi: </label>
                  {this.state.sporcu.dogumtarihi}
                </div>
                <div >
                <label >Sporcu Kulüp: </label>
                  {this.state.sporcu.kulüp}
                </div>
                <div >
                <label >Sporcu Sı No: </label>
                  {this.state.sporcu.sıno}
                  </div>
              </div>
            </div>
          </div>
      </div>
    )
  }
}

export default withRouter(ViewSporcuComponent);
