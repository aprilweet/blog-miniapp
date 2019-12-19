const common = require('./common.js')
const cheerio = require('cheerio')

module.exports.update = async function(config) {
  const nexts = [{
      url: config.wish_url,
      state: '想看'
    },
    {
      url: config.do_url,
      state: '在看'
    },
    {
      url: config.collect_url,
      state: '看过'
    }
  ]

  let ok = true
  let ret = []

  for (let next of nexts) {
    while (next) {
      console.log('Update movies page ' + next.url + ' ...');
      let movies = null;
      [movies, next] = await get(config.movie_site, next)
      if (movies == null) {
        console.error('Get movies page failed')
        ok = false
        break
      }
      console.debug(movies)

      ret.push(common.addHalf('movie', movies))
    }
  }

  if (ok) {
    try {
      await Promise.all(ret)
    } catch (e) {
      console.error(e.toString())
      ok = false
    }
  }

  if (ok) {
    await common.addConfirm('movie')
    return true
  } else {
    await common.addRollback('movie')
    return false
  }
}

async function get(site, next) {
  const html = await common.get(site + next.url)
  if (html == null)
    return [null, null]

  const $ = cheerio.load(html)

  const movies = $('.article > .grid-view > .item').map(function() {
    const titles = $(this).find('.info .title em').first().text().strip().split('/', 2).map(s => s.strip())
    const movie = {
      link: $(this).find('.pic .nbg').first().attr('href').strip(),
      img: $(this).find('.pic img').first().attr('src').strip(),
      title: titles[0] || null,
      alias: titles[1] || null,
      intro: $(this).find('.info .intro').first().text().strip()
    }

    const date = $(this).find('.info .date').text().strip()
    const rating = $(this).find('.info [class^=rating]').attr('class')
    const comment = $(this).find('.info .comment').text().strip()

    return {
      date: new Date(date),
      state: next.state,
      rating: rating ? common.getRating(rating) : null,
      comment: comment || null,
      info: movie
    }
  }).toArray()

  next.url = $('.paginator .next a').attr('href') || null
  next = next.url ? next : null

  return [movies, next]
}