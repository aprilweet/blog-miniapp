const common = require('./common.js')
const cheerio = require('cheerio')

module.exports.update = async function(config) {
  let next = config.book_url

  let ok = true
  let ret = []

  while (next) {
    console.log('Update books page ' + next + ' ...')
    let books = null;
    [books, next] = await get(config.book_site, next)
    if (books == null) {
      console.error('Get books page failed')
      ok = false
      break
    }
    console.debug(books)

    ret.push(common.addHalf('book', books))
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
    await common.addConfirm('book')
    return true
  } else {
    await common.addRollback('book')
    return false
  }
}

async function get(site, next) {
  const html = await common.get(site + next)
  if (html == null)
    return [null, null]

  const $ = cheerio.load(html)

  const books = $('.article > .interest-list > .subject-item').map(function() {
    const book = {
      link: $(this).find('.pic .nbg').first().attr('href').strip(),
      img: $(this).find('.pic img').first().attr('src').strip(),
      title: $(this).find('.info a').first().text().strip(),
      pub: $(this).find('.info .pub').first().text().strip()
    }

    const [date, state] = $(this).find('.info .date').text().split(/\s+/, 2).map(s => s.strip())
    const rating = $(this).find('.info [class^=rating]').attr('class')
    const comment = $(this).find('.info .comment').text().strip()

    return {
      date: new Date(date),
      state,
      rating: rating ? common.getRating(rating) : null,
      comment: comment || null,
      info: book
    }
  }).toArray()

  next = $('.paginator .next a')
  next = next.length == 0 ? null : next.attr('href')

  return [books, next]
}