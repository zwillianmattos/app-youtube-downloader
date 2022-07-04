import { Button, Container, TextField, RadioGroup, FormLabel, FormControlLabel, Radio } from "@mui/material";
import React from "react";
import { useState } from 'react';
import api from "./api";
import mimeDb from "mime-db";

export function App(): JSX.Element {
    const [loading, setLoading] = useState(false);

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    const [urlYoutube, setTextInput] = useState('');
    const handleTextInputChange = (event: any) => {
        setTextInput(event.target.value);
    };

    const [listaFormatosDisponiveis, setListaFormatosDisponiveis] = useState([]);

    function buscaFormatosDisponiveisApi() {
        setLoading(true);
        let getVideoUrl = new URL(urlYoutube)
        let videoId = new URLSearchParams(getVideoUrl.searchParams).get('v');

        api.get(`/downloader/${videoId}`).then((response: any) => {
            let filtroFormatos = response.data.filter((formato: any) => formato.resolution != null);
            setListaFormatosDisponiveis(filtroFormatos);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        })
    }

    const [formatoSelecionado, setFormatoSelecionado] = useState('');
    const handleFormatoSelecionado = (event: any) => {
        setFormatoSelecionado(event.target.value);
    }

    function download() {
        setLoading(true);
        let getVideoUrl = new URL(urlYoutube)
        let videoId = new URLSearchParams(getVideoUrl.searchParams).get('v');

        api.request({
            url: `/downloader/${videoId}?itag=${formatoSelecionado}`,
            method: 'POST',
            responseType: 'blob',
        }).then(({ data }) => {
            console.log(data)
            const downloadUrl = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = downloadUrl;

            let mime: any = mimeDb[data.type];
            console.log(mime)
            link.setAttribute('download', `${makeid()}.${mime.extensions[0]}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        })
    }

    return (<div>
        <Container >
            <img src={`https://raw.githubusercontent.com/zwillianmattos/api-youtube-downloader-python/master/logo.jpg`} width={`250`} />
            <br /><br />
            <TextField
                id="outlined-basic"
                label={`Cole a url do video`}
                variant="outlined"
                value={urlYoutube}
                onChange={handleTextInputChange} />
            <br /><br />
            <Button variant="contained" onClick={buscaFormatosDisponiveisApi}>Buscar</Button>
            <br /><br />
            {loading ? <>
                <img src={`https://thumbs.gfycat.com/GeneralUnpleasantApisdorsatalaboriosa-size_restricted.gif`} width={250} />
            </> : listaFormatosDisponiveis.length > 0 ?
                <>
                    <FormLabel id="formato-group-label">Formato</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue={listaFormatosDisponiveis[0]}
                        name="radio-buttons-group"
                    >
                        {listaFormatosDisponiveis.map((formato: any) => {
                            return (
                                <FormControlLabel value={formato.itag} control={<Radio />} label={`${formato.resolution} - ${formato.mime_type}`} onChange={handleFormatoSelecionado} />
                            );
                        })}

                    </RadioGroup>

                    <Button variant="contained" onClick={download}>Baixar</Button></>
                : <></>
            }
        </Container>
    </div>);
}