import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import EditPackages from '~/components/EditPackages.vue'

function findAllPackages(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.group').map(n => n.text())
}

it('renders chips and sorts by default/profile order', async () => {
  const wrapper = mount(EditPackages, {
    props: {
      modelValue: ['pkg-profile', 'pkg-default', 'pkg-other2', 'pkg-other1'],
      defaultPackages: ['pkg-default'],
      profilePackages: ['pkg-profile'],
    },
  })

  const labels = findAllPackages(wrapper)
  expect(labels).toEqual(['pkg-default', 'pkg-profile', 'pkg-other1', 'pkg-other2'])
})

it('adds package on Enter and prevents duplicates', async () => {
  const wrapper = mount(EditPackages, {
    props: {
      modelValue: ['existing_pkg'],
      defaultPackages: [],
      profilePackages: [],
    },
  })

  const input = wrapper.get('input')
  await input.setValue('existing_pkg')
  await input.trigger('keydown', { key: 'Enter' })

  const items = findAllPackages(wrapper)
  expect(items.filter(x => x === 'existing_pkg')).toHaveLength(1)
})

it('removes a package when clicking the close button', async () => {
  const wrapper = mount(EditPackages, {
    props: {
      modelValue: ['remove-me'],
      defaultPackages: [],
      profilePackages: [],
    },
  })

  // ensure chip exists
  expect(findAllPackages(wrapper)).toContain('remove-me')

  const closeBtn = wrapper.get('.group button')
  await closeBtn.trigger('click')

  void expect(findAllPackages(wrapper)).toHaveLength(0)
})

it('pops last package on Backspace when input is empty', async () => {
  const wrapper = mount(EditPackages, {
    props: {
      modelValue: ['first', 'last'],
      defaultPackages: [],
      profilePackages: [],
    },
  })

  const input = wrapper.get('input')
  // ensure empty value
  await input.setValue('')
  await input.trigger('keydown', { key: 'Backspace' })

  expect(findAllPackages(wrapper)).toEqual(['first'])
})

it('handles paste event and adds multiple packages', async () => {
  const wrapper = mount(EditPackages, {
    props: {
      modelValue: [],
      defaultPackages: [],
      profilePackages: [],
    },
  })

  const input = wrapper.get('input')
  const clipboard = {
    getData: (_type: string) => 'one two,three\nfour',
  }

  await input.trigger('paste', { clipboardData: clipboard })

  expect(findAllPackages(wrapper)).toEqual(['one', 'two', 'three', 'four'].toSorted())
})
