import { useState, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import SubHead from '../components/SubHeader'
import Content from '../components/Content'
import { Segment } from '../interfaces/segment'
import { CourseDetail } from '../interfaces/course'
import LectureSearchBar from '../components/Search/LectureSearchBar'
import LecureCell from '../components/Search/LecureCell'
import styles from '../styles/index.module.scss'
import Warning from '../components/Search/Warning'

interface StaticIndexProps {
  segments: Segment[]
  courses: CourseDetail[]
}

const index = (props: StaticIndexProps) => {
  const [searchText, setSearchText] = useState('')
  const [isFilled, setIsFilled] = useState(false)

  const keyInputEvent = (text: string) => {
    setSearchText(text)
  }

  const title = '逆評定 - Titech Info : 東工大情報サイト'

  const filteredLectures = useMemo(() => {
    if (searchText.length === 0) {
      return []
    }
    const splitSearchText = searchText.replace('　', ' ').split(' ')

    return props.courses.filter(course =>
      splitSearchText.every(searchword =>
        course.keywords.some(keyword =>
          keyword.toLocaleLowerCase().includes(searchword.toLocaleLowerCase()),
        ),
      ),
    )
  }, [props.courses, searchText])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <SubHead />
      <div className="Container">
        <LectureSearchBar
          keyInputEvent={keyInputEvent}
          changeIsFilled={isFilled => setIsFilled(isFilled)}
        />
        {isFilled ? (
          searchText.length !== 0 ? (
            <div className={styles.Container}>
              {filteredLectures.map(lecture => (
                <LecureCell
                  key={lecture.id}
                  id={lecture.id}
                  name={lecture.courseName}
                  teachers={lecture.teachers}
                />
              ))}
            </div>
          ) : (
            <Warning></Warning>
          )
        ) : (
          <Content {...props} />
        )}
      </div>
    </div>
  )
}

export default index

export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch(
    'https://titechinfo-data.s3-ap-northeast-1.amazonaws.com/course-review-tmp/school_departments.json',
  )
  const segments: Segment[] = await res.json()
  const response = await fetch(
    `https://titechinfo-data.s3-ap-northeast-1.amazonaws.com/course-review-tmp/search_keywords.json`,
  )
  const courses: CourseDetail[] = await response.json()
  return {
    props: {
      segments,
      courses,
    },
  }
}
