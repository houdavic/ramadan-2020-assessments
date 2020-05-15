const ListOfVidsReqElm = document.getElementById('listOfRequests')
let sortBy = "newFirst"
let searchTerm = ""

function renderSinleVidReq(vidInfo, isPrepend = false) {
  const listReqTemplate = `
<div class="card mb-3">
<div class="card-body d-flex justify-content-between flex-row">
  <div class="d-flex flex-column">
    <h3>${vidInfo.topic_title}</h3>
    <p class="text-muted mb-2">${vidInfo.topic_details}</p>
    <p class="mb-0 text-muted">
    ${vidInfo.expected_result &&
    `<strong>Expected results:</strong> 
      ${vidInfo.expected_result}`
    }
    </p>
  </div>
  <div class="d-flex flex-column text-center">
    <a id='votes_ups_${vidInfo._id}' class="btn btn-link">🔺</a>
    <h3 id='score_vote_${vidInfo._id}'>${vidInfo.votes.ups - vidInfo.votes.downs}</h3>
    <a id='votes_downs_${vidInfo._id}' class="btn btn-link">🔻</a>
  </div>
</div>
<div class="card-footer d-flex flex-row justify-content-between">
  <div>
    <span class="text-info">${vidInfo.status.toUpperCase()}</span>
    &bullet; added by <strong>${vidInfo.author_name}</strong> on
    <strong>${new Date(vidInfo.submit_date).toLocaleDateString()}</strong>
  </div>
  <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
    <div class="badge badge-success">
      ${vidInfo.target_level}
    </div>
  </div>
</div>
`
  const vidReqContainerELm = document.createElement('div')
  vidReqContainerELm.innerHTML = listReqTemplate

  isPrepend ?
    ListOfVidsReqElm.prepend(vidReqContainerELm)
    :
    ListOfVidsReqElm.appendChild(vidReqContainerELm)

  const votesUpsElm = document.getElementById(`votes_ups_${vidInfo._id}`)
  const votesDownsElm = document.getElementById(`votes_downs_${vidInfo._id}`)
  const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`)

  votesUpsElm.addEventListener('click', (e) => {
    fetch('http://localhost:7777/video-request/vote', {
      method: 'PUT',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify({
        id: vidInfo._id,
        vote_type: 'ups'
      })
    })
      .then(res => res.json())
      .then(res => {
        scoreVoteElm.innerHTML = res.ups - res.downs
      })
  })

  votesDownsElm.addEventListener('click', (e) => {
    fetch('http://localhost:7777/video-request/vote', {
      method: 'PUT',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify({
        id: vidInfo._id,
        vote_type: 'downs'
      })
    })
      .then(res => res.json())
      .then(res => {
        scoreVoteElm.innerHTML = res.ups - res.downs
      })
  })
}

function loadAllVidReqs(sortBy = 'newFirst', searchTerm) {

  let params = `?sortBy=${sortBy}`

  if (searchTerm)
    params = `${params}&searchTerm=${searchTerm}`

  fetch(`http://localhost:7777/video-request${params}`)
    .then(res => res.json())
    .then(res => {
      console.log(res)
      ListOfVidsReqElm.innerHTML = ''
      res.forEach(vidReq => {
        if (vidReq.topic_title) {
          renderSinleVidReq(vidReq)
        }
      }
      )
    })

}

function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
};

document.addEventListener('DOMContentLoaded', function () {
  const formVidReqElm = document.getElementById('formVideoRequest')
  const sortByElms = document.querySelectorAll('[id*=sort_by_]')
  const searchBoxELm = document.getElementById('search_box')

  loadAllVidReqs(sortBy, searchTerm)

  searchBoxELm.addEventListener('input', debounce((e) => {
    searchTerm = e.target.value
    loadAllVidReqs(sortBy, searchTerm)
  }, 1000))

  sortByElms.forEach(elm => {
    elm.addEventListener('click', function (e) {
      e.preventDefault()

      sortBy = this.querySelector('input').value

      loadAllVidReqs(sortBy, searchTerm)

      this.classList.add('active');

      if (sortBy === "topVotedFirst")
        document.getElementById('sort_by_new').classList.remove('active')
      else
        document.getElementById('sort_by_top').classList.remove('active')
    })
  })

  formVidReqElm.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log(e)
    const formData = new FormData(formVidReqElm)
    fetch('http://localhost:7777/video-request', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then((res) => {
        console.log(res)
        renderSinleVidReq(res, true)
      })
  })


})