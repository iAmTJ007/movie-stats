import { useEffect,useRef, useState } from "react";
import StarRating from "./StarRating";
const average = (arr) =>
arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key="1e55b583";


export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(function(){
    const storedItem=localStorage.getItem('watched');
    return JSON.parse(storedItem);
  });
  const [isLoading,setIsLoading]=useState(false);
  const [error,setError]=useState("");
  const [query,setQuery]=useState("");
  const [selectedId,setSelectedId]=useState(null);

  function handleAddMovie(movie,userRating){
    const alreadyWatchedOrNot=watched.map((cmovie)=>cmovie.imdbID).includes(movie.imdbID);
    if(alreadyWatchedOrNot===false && userRating!==0){
      movie.userRating=userRating;
      setWatched([...watched,movie]);
    } 
  }
  
  useEffect(function(){
    localStorage.setItem("watched",JSON.stringify(watched));
  },[watched]);

  useEffect(function(){
    async function fetchMovies(){
      try{
        setError(""); //always reset error while doing each re render
        setIsLoading(true);
        const res=await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${query}`);
        if(!res.ok)
            throw new Error("Something went wrong check your internet")
        const data=await res.json();
        if(data.Response==="False") throw new Error("Movie not Found");
        setMovies(data.Search);
      }
      catch(err){
        setError(err.message);
      }
      finally{
        setIsLoading(false)
      }
      
    }
    if(query!==""){
      fetchMovies();
    }
    
  },[query]);

  function handleMovieOnClick(imdbID){
    setSelectedId(imdbID);
  }

  return (
    <>
      <NavBar> {/*important concept of composition fixing the issue of prop drilling */}
        <Logo/>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies}/>
      </NavBar>
      <Main>
        {
          isLoading===false&&error===""?<Box> {/*reusability of box*/}
          <List1 movies={movies} handleMovieOnClick={handleMovieOnClick}/>
        </Box>:""
        }
        {
          error!==""?error:""
        }
        {
          isLoading===true?"loading":""
        }
        
        <Box>
        {
          selectedId!==null?<MovieDetails handleAddMovie={handleAddMovie} setSelectedId={setSelectedId} selectedId={selectedId}/>:
          <>
            <WatchedSummary  watched={watched}/>
            <WatchedMovieList watched={watched}/>
          </>
        }
            
        </Box>
      </Main>  
    </>
  );
}
function NavBar({children}){
  return(
      <nav className="nav-bar">
        {children}
      </nav>)
}
function Logo(){
  return(
    <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
        </div>
  )
}
function Search({query,setQuery}){
  const inputEl=useRef(null);
  useEffect(function(){
    inputEl.current.focus();
  })
  return(
    <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputEl}
        />
  )
}
function NumResults({movies}){
  return(
    <p className="num-results">
          Found <strong>{movies.length}</strong> results
        </p>
  )
}
function Main({children}){
  return(
      <main className="main">
        {children}
      </main>)
}
function Box({children}){
  const [isOpen, setIsOpen] = useState(true);

  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && children}
    </div>
  )
}
function List1({movies,handleMovieOnClick}){
  
  return(
    <ul className="list">
              {movies?.map((movie) => (
                <Movie handleMovieOnClick={handleMovieOnClick} movie={movie}/>      
              ))}
      </ul>
  )
}
function Movie({movie,handleMovieOnClick}){
  return(
    <li onClick={()=>handleMovieOnClick(movie.imdbID)} key={movie.imdbID}>
                  <img src={movie.Poster} alt={`${movie.Title} poster`} />
                  <h3>{movie.Title}</h3>
                  <div>
                    <p>
                      <span>🗓</span>
                      <span>{movie.Year}</span>
                    </p>
                  </div>
      </li>
  )
}

function WatchedSummary({watched}){
  const avgImdbRating = parseFloat(average(watched.map((movie) => movie.imdbRating)).toFixed(2));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = parseInt(average(watched.map((movie) => parseInt(movie.Runtime))));
  return(
    <div className="summary">
                <h2>Movies you watched</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                  </p>
                </div>
              </div>
  )
}
function WatchedMovieList({watched}){
  return(
    <ul className="list">
                {watched.map((movie) => (
                  <li key={movie.imdbID}>
                    <img src={movie.Poster} alt={`${movie.Title} poster`} />
                    <h3>{movie.Title}</h3>
                    <div>
                      <p>
                        <span>⭐️</span>
                        <span>{movie.imdbRating}</span>
                      </p>
                      <p>
                        <span>🌟</span>
                        <span>{movie.userRating}</span>
                      </p>
                      <p>
                        <span>⏳</span>
                        <span>{movie.Runtime}</span>
                      </p>
                    </div>
                  </li>
                ))}
      </ul>
  )
}
function MovieDetails({handleAddMovie,setSelectedId,selectedId}){
  const [userRating,setUserRating]=useState(0);
  const [movie,setMovie]=useState({});

  function updateUserRating(rating){
    setUserRating(rating);
 
  }
  useEffect(function(){
    function callback(e){ 
      if(e.code==='Escape'){
        setSelectedId(null);
      }  
    } 
    document.addEventListener("keydown",callback)    
    return function(){
      document.removeEventListener("keydown",callback);
      console.log("remove the event");
    }
  },[setSelectedId])
  useEffect(function(){
    async function getMovieDetails(){
      const res=await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`);
      const data=await res.json();
      setMovie(data);
    }
    getMovieDetails();
  },[selectedId]);
  return(
    <div className="details">
      <header>
        <button onClick={()=>setSelectedId(null)} className="btn-back">&larr;</button>
        <img src={movie.Poster} alt="movie poster not found"/>
        <div className="details-overview">
          <h2>{movie.Title}</h2>
          <p>{movie.Year} &bull; {movie.Runtime}</p>
          <p>{movie.Genre}</p>
          <p>{movie.imdbRating} IMDB Rating</p>
        </div>
      </header>  
      <section>
        <div className="rating"><StarRating updateUserRating={updateUserRating} maxRating={10} size="20px"/></div>
        <button className="btn-add" onClick={()=>handleAddMovie(movie,userRating)}>Add to List</button>
          <p><em>{movie.Plot}</em></p>
          <p>Starring {movie.Actors}</p>
          <p>Directed by {movie.Director}</p>
      </section>
      
    </div>
  )
}