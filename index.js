"use strict";
const fs = require("fs"),
    pg = require("pg"),
    util = require("util"),
    http = require("https"),
    axios = require('axios'),
    {options} = require("pg/lib/defaults");

var optionsCurrentApi = {
    host: "https://rickandmortyapi.com/",
};

const tableName = 'leonid_heroes'

const config = {
    connectionString:
    // "postgres://user1:123456@0.0.0.0:5432/postgres",
        "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs
            .readFileSync("/Users/leoniddomanin/WebstormProjects/morty-task/.postgresql/root.crt")
            .toString(),
    }
};


async function getHeroes(page) {
    const response = await axios.get(`${optionsCurrentApi.host}api/character?page=${page}`)
    return response.data
}

const start = async function (a, b) {

    const conn = new pg.Client(config);

    conn.connect((err) => {

        if (err) throw err;

        conn.query("SELECT version()", (err, res) => {
            if (err) throw err;
            console.log(res.rows[0]);
            // conn.end();
        });
        /**
         * name / type / initial settings / default value
         * jsonb n
         */
        conn.query(`CREATE TABLE IF NOT EXISTS  ${tableName} (
        id serial not null, -- id integer NOT NULL DEFAULT nextval('table_name_id_seq')
        "name" text not null ,
        "data" jsonb not null)`, (err, res) => {
            if (err) throw err;
            // console.log(res.rows[0]);
            // conn.end();
        });
    });

    const insertHero = async (name, data) => {
        try {
            await conn.query(
                `INSERT INTO ${tableName} ("name", "data")  
             VALUES ($1, $2)`, [name, data]); // sends queries
            return true;
        } catch (error) {
            console.error(error.stack);
            return false;
        } finally {
            // closes connection
        }
    };

    let pageStart = 1;

    while (true) {
        // Not handler error
        let data = await getHeroes(pageStart);
        if (!data.hasOwnProperty('info') && !data.hasOwnProperty('results')) {
            throw new Error('Error json')
            break
        }
        for (const hero of data.results) {
            await insertHero(hero.name, hero)
        }
        pageStart++
    }

    await conn.end();

}

start();
