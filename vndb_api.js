const VNDB = require('vndb-api');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const vndb = new VNDB('clientname', {
    minConnection: 1,
    maxConnection: 10,
  })

// 배열을 받아 csv로 작성하는 함수
function write_into_csv (data_arr){
    const csvWriter = createCsvWriter({
        path: "./csv-db/file.csv",
        header: [
            {id:"id", title: "id"}, 
            {id: "title", title: "title"},
            {id: "original", title: "original"},
            {id: "released", title: "released"},
            {id: "image", title: "image"},
            {id: "rating", title: "rating"},
            {id: "votecount", title: "votecount"},
            {id: "length", title: "length"}
        ],
        encoding: "utf8",
        append: true
    });

    csvWriter.writeRecords(data_arr).then(() => {
        console.log("...csv Done");
    });
};

//main 함수
async function vndb_crawl (){

    for(let i=1; true; i++){      // released > "2018" and released <= "2019" 59페이지 10번만 안됨(1개 오류) 
                                   // released > "2017" and released <= "2018 142페이지 10번만 설명까지만 나옴 (1개 오류)
        console.log("arr refresh!")// released > "2015" and released <= "2016" 9페이지 10개 오류남 
        var data_arr = await vndb_query(`get vn basic,details,stats (released > "2008" and released <= "2009") {"page": ${i}, "results": 10}`);
        console.log(data_arr);
        write_into_csv(data_arr[0]);
        if(data_arr[1] === false){
            return 0;
        }       
    }
}

//vndb에 쿼리 보내서 정보를 객체에 저장 후 객체 반환
function vndb_query(query){
    return new Promise(function(resolve, reject){
        console.log(query);
        vndb
        .query(query)
            .then(res => {
                const data_arr=[];
                res.items.forEach(function(item){
                    const data_obj = {
                        id: item.id,
                        title: item.title,
                        original: item.original,
                        released: item.released,
                        image: item.image,
                        rating: item.rating,
                        votecount: item.votecount,
                        length: item.length
                    };
                    data_arr.push(data_obj);
                    console.log(data_obj);
                });
                resolve([data_arr, res.more]);  // 다음 페이지가 있는지 여부 함께 전달
            })
            .catch(err => {
                console.log(err)
            })
    })
}


vndb_crawl().finally(() => {
    vndb.destroy()
});